//This file represents the code that will work whenever the match starts.
use std::{net::SocketAddr, ops::ControlFlow, string, sync::Arc};

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
use serde_json::{from_str, to_string};
use sqlx::{postgres::PgListener, PgPool, Row};
use tokio::sync::{mpsc, Mutex};

use crate::api::{db::get_listener, state::AppState};

#[derive(Deserialize, Serialize, Debug)]
pub struct WSMessage {
    table_code: String,
    user_code: String,
    msg: String,
    msg_type: String,
    open: Option<bool>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct MatchData {
    code: String,
    user_one_code: String,
    user_two_code: Option<String>,
    open: bool,
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
    State(app_state): State<Arc<Mutex<AppState>>>,
) -> impl IntoResponse {
    let listener = get_listener().await;
    //Upgrades http request to websocket connection. Handshake is done automatically.
    ws.on_upgrade(move |socket| handle_socket(socket, addr, app_state, listener))
}

//Actual websocket handler. One websocket will spawn per connection, so per client.
pub async fn handle_socket(
    socket: WebSocket,
    addr: SocketAddr,
    state: Arc<Mutex<AppState>>,
    mut listener: PgListener,
) {
    let code = Arc::new(Mutex::new(String::new()));

    //Subscribing to our broadcast channel.
    let mut rx = state.lock().await.tx.subscribe();
    println!("{} connected to websocket", addr);

    //Socket splitting to both send and receive at the same time.
    let (mut sender, mut receiver) = socket.split();

    //Listen to postgreSQl in channel "test_row_added"
    listener
        .listen("added_match")
        .await
        .expect("Could not listen to added_match function");

    //Sends initial available matches.
    let rows = sqlx::query("SELECT * FROM matches WHERE open = true")
        .fetch_all(&state.lock().await.pool)
        .await
        .expect("Could not retrieve matches");

    let matches: Vec<MatchData> = rows
        .iter()
        .map(|a| MatchData {
            code: a.get("code"),
            user_one_code: a.get("user_one_code"),
            user_two_code: a.get("user_two_code"),
            open: a.get("open"),
        })
        .collect();

    let matches_message: WSMessage = WSMessage {
        table_code: String::new(),
        user_code: String::new(),
        msg: to_string(&matches).unwrap(),
        msg_type: String::from("Matches"),
        open: None,
    };
    sender
        .send(Message::Text(to_string(&matches_message).unwrap()))
        .await
        .unwrap();


    //Function fired when we want to send a message.
    let mut send_msg = {
        let code = code.clone();
        tokio::spawn(async move {
            while let Ok(msg) = rx.recv().await {
                dbg!(&msg);
                let parsed: WSMessage = from_str(msg.as_str()).unwrap();
                let code_guard = code.lock().await;
                if code_guard.clone() == parsed.table_code {
                    // If any websocket error, break loop.
                    sender.send(Message::Text(msg)).await.unwrap();
                }
            }
        })
    };

    let mut _update_matches = {
        let pg_sender = state.clone();
        tokio::spawn(async move {
            while let Ok(msg) = listener.recv().await {
                let notification_message: WSMessage = WSMessage {
                    table_code: String::new(),
                    user_code: String::new(),
                    msg: msg.payload().to_string(),
                    msg_type: String::from("PgNotification"),
                    open: Some(true),
                };
                let wasd = to_string(&notification_message).unwrap();
                println!("Hey there");
                pg_sender.lock().await.sctx.send(wasd).await.unwrap();
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
                        let mut parsed: WSMessage = from_str(t.as_str()).unwrap();
                        //Handler for type of message CTable. This piece of code creates a row in our matches table.
                        if parsed.msg_type == "CTable" {
                            /* This query will create a new row inside our database. Only the table code and the first player code will be filled at this point */
                            let result = sqlx::query(
                                "INSERT INTO matches (code, user_one_code, open) VALUES ($1, $2, $3);",
                            )
                            .bind(&parsed.table_code)
                            .bind(&parsed.user_code)
                            .bind(parsed.open)
                            .execute(&state.lock().await.pool)
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
                            .execute(&state.lock().await.pool)
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
                                .execute(&state.lock().await.pool)
                                .await
                                .expect("Could not delete match from database.");
                            let mut code_guard = code.lock().await;
                            //Empties current table code state.
                            *code_guard = String::new();
                        }
                        // Serialize edited message to send it to client.
                        let serialized = serde_json::to_string(&parsed).unwrap();
                        // Send edited message to client (send_msg function)
                        let _ = state.lock().await.tx.send(serialized);
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
                        //If user had a table code, it means he exited mid-match so we need to delete the match from our database.
                        if !code_guard.is_empty() {
                            sqlx::query("DELETE FROM matches WHERE code = $1;")
                                .bind(code_guard.clone())
                                .execute(&state.lock().await.pool)
                                .await
                                .expect("Could not delete match from database.");
                        }
                        end_process();
                    }
                }
            }
        })
    };

    /*     tokio::select! {
            _ = (&mut receive_msg) => {send_msg.abort()},
            _ = (&mut send_msg) => {receive_msg.abort()},
    /*         _ = (&mut update_matches) => {send_msg.abort(); receive_msg.abort()} */
        }; */
}

//Terminates the web socket.
fn end_process() -> ControlFlow<(), ()> {
    ControlFlow::Break(())
}

//Retrieves open matches from our database
/* async fn get_matches(pool: PgPool) -> WSMessage {
    let rows = sqlx::query("SELECT * FROM matches WHERE open = true")
        .fetch_all(&pool)
        .await
        .expect("Could not retrieve matches");

    let matches: Vec<MatchData> = rows
        .iter()
        .map(|a| MatchData {
            code: a.get("code"),
            user_one_code: a.get("user_one_code"),
            user_two_code: a.get("user_two_code"),
            open: a.get("open"),
        })
        .collect();

    let matches_message: WSMessage = WSMessage {
        table_code: String::new(),
        user_code: String::new(),
        msg: to_string(&matches).unwrap(),
        msg_type: String::from("Matches"),
        open: None,
    };

    matches_message
    //
} */
