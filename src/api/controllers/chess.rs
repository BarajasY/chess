//This file represents the code that will work whenever the match starts.
use std::{net::SocketAddr, ops::ControlFlow, sync::Arc};

use axum::{
    debug_handler,
    extract::{
        ws::{Message, WebSocket},
        ConnectInfo, State, WebSocketUpgrade,
    },
    response::IntoResponse,
};

use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::from_str;
use sqlx::postgres::PgListener;
use tokio::sync::Mutex;

use crate::api::{db::get_listener, state::AppState};

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct Test {
    id: i32,
    name: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct ReceivedMessage {
    table_code: String,
    user_code: String,
    msg: String,
    msg_type: String,
}

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct Match {
    id: i32,
    code: String,
    user_one_code: String,
    user_two_code: String,
}

//function for test purposes.
pub async fn root() -> String {
    String::from("Hello from rust")
}

//Iniital http handler, this function basically transforms our http request to a websocket connection.
#[debug_handler]
pub async fn handle_ws(
    ws: WebSocketUpgrade,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(app_state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let listener = get_listener().await;
    //Upgrades http request to websocket connection. Handshake is done automatically.
    ws.on_upgrade(move |socket| handle_socket(socket, addr, app_state, listener))
}

//Actual websocket handler. One websocket will spawn per connection, so per client.
pub async fn handle_socket(
    socket: WebSocket,
    addr: SocketAddr,
    state: Arc<AppState>,
    mut listener: PgListener,
) {
    let code = Arc::new(Mutex::new(String::new()));

    //Subscribing to our broadcast channel.
    let mut rx = state.tx.subscribe();
    println!("{} connected to websocket", addr);

    //Socket splitting to both send and receive at the same time.
    let (mut sender, mut receiver) = socket.split();

    //Listen to postgreSQl test_row_added
    listener
        .listen("test_row_added")
        .await
        .expect("Could not listen to test_row_added yo");

    //Function fired when we want to send a message.
    let mut send_msg = {
        let code = code.clone();
        tokio::spawn(async move {
            while let Ok(msg) = rx.recv().await {
                let parsed: ReceivedMessage = from_str(msg.as_str()).unwrap();
                let code_guard = code.lock().await;
                if *code_guard == parsed.table_code {
                    // In any websocket error, break loop.
                    if sender.send(Message::Text(msg)).await.is_err() {
                        break;
                    }
                }
            }
        })
    };

    //Function that fires when a message is received.
    let mut receive_msg = {
        tokio::spawn(async move {
            while let Some(Ok(msg)) = receiver.next().await {
                match msg {
                    //Print text.
                    Message::Text(t) => {
                        let mut parsed: ReceivedMessage = from_str(t.as_str()).unwrap();
                        //Handler for type of message CTable. This piece of code creates a row in our matches table.
                        if parsed.msg_type == "CTable" {
                            /* This query will create a new row inside our database. Only the table code and the first player code will be filled at this point */
                            let result = sqlx::query(
                                "INSERT INTO matches (code, user_one_code) VALUES ($1, $2);",
                            )
                            .bind(&parsed.table_code)
                            .bind(&parsed.user_code)
                            .execute(&state.pool)
                            .await
                            .expect("Could not create match row");

                            //If query actually affects the database (create a new row) update state code.
                            if result.rows_affected() > 0 {
                                let mut code_guard = code.lock().await;
                                *code_guard = parsed.table_code.clone();
                                parsed.msg = String::from("Created Table!");
                            }
                        //Handler for type of message JTable, basically controls how a user joins a table.
                        } else if parsed.msg_type == "JTable" {
                            /* This query edits a row from our database only to insert the code of the second player. */
                            let result = sqlx::query(
                                "UPDATE matches SET user_two_code = $1 WHERE code = $2;",
                            )
                            .bind(&parsed.user_code)
                            .bind(&parsed.table_code)
                            .execute(&state.pool)
                            .await
                            .expect("Could not join table");
                            // If table row was actually edited, assign the table code to the user.
                            if result.rows_affected() > 0 {
                                let mut code_guard = code.lock().await;
                                *code_guard = parsed.table_code.clone();
                                parsed.msg = String::from("Joined Table");
                            }
                        //Handler for Deleting matches from database..
                        } else if parsed.msg_type == "Delete" {
                            sqlx::query("DELETE FROM matches WHERE code = $1;")
                                .bind(&parsed.table_code)
                                .execute(&state.pool)
                                .await
                                .expect("Could not delete match from database.");
                            println!("heyt");
                            let mut code_guard = code.lock().await;
                            *code_guard = String::new();
                        }
                        // Serialize edited message to send it to client.
                        let serialized = serde_json::to_string(&parsed).unwrap();
                        // Send edited message to client (send_msg function)
                        let _ = state.tx.send(serialized);
                    }
                    //Print binaries
                    Message::Binary(b) => {
                        println!("Received bytes {:?}", b);
                    }
                    //Print ping
                    Message::Ping(pi) => {
                        println!("Received ping {:?}", pi);
                    }
                    //Print pong
                    Message::Pong(po) => {
                        println!("Received pong {:?}", po);
                    }
                    //Close websocket request.
                    Message::Close(_) => {
                        println!("{} closed connection", addr);
                        let code_guard = code.lock().await;
                        if !code_guard.is_empty() {
                            sqlx::query("DELETE FROM matches WHERE code = $1;")
                                .bind(code_guard.clone())
                                .execute(&state.pool)
                                .await
                                .expect("Could not delete match from database.");
                        }
                        end_process();
                    }
                }
            }
        })
    };

    tokio::select! {
        _ = (&mut receive_msg) => send_msg.abort(),
        _ = (&mut send_msg) => receive_msg.abort(),
    };
}

//Terminates the web socket.
fn end_process() -> ControlFlow<(), ()> {
    ControlFlow::Break(())
}
