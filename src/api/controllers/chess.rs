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
use serde_json::{from_str, to_string};
use sqlx::{postgres::PgListener, Row};
use tokio::sync::Mutex;

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
pub struct WSMessageCoordinates {
    table_code: String,
    user_code: String,
    msg: MovementCoordinates,
    msg_type: String,
    open: Option<bool>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Coordinates {
    x: i8,
    y: i8,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct MovementCoordinates {
    origin: Coordinates,
    end: Coordinates,
}

#[derive(Deserialize, Serialize, Debug)]
enum WSMessageVariant {
    String(String),
    Coordinates(WSMessageCoordinates),
}

#[derive(Deserialize, Serialize, Debug)]
pub struct MatchData {
    code: String,
    user_one_code: String,
    user_two_code: Option<String>,
    open: bool,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct MsgType {
    msg_type: String,
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
    ws.on_upgrade(move |socket| handle_socket(socket, app_state, listener))
}

//Actual websocket handler. One websocket will spawn per connection, so per client.
pub async fn handle_socket(
    socket: WebSocket,
    state: Arc<Mutex<AppState>>,
    mut listener: PgListener,
) {
    //Making the code a mutable ARC with arc mutex of our websocket connection.
    let code = Arc::new(Mutex::new(String::new()));
    let team_number = Arc::new(Mutex::new(0));

    //Subscribing to our broadcast channel for global communication.
    let mut rx = state.lock().await.tx.subscribe();

    //Socket splitting to both send and receive at the same time.
    let (sender, mut receiver) = socket.split();

    //Generating arc mutex of sender to use it in multiple functions.
    let sender2 = Arc::new(Mutex::new(sender));

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

    let initial_sender = sender2.clone();
    //Sends to client matches currently in our database.
    initial_sender
        .lock()
        .await
        .send(Message::Text(to_string(&matches_message).unwrap()))
        .await
        .unwrap();

    //Function fired when we want to send a message.
    let mut send_msg = {
        let code = code.clone();
        let msg_sender = sender2.clone();
        tokio::spawn(async move {
            while let Ok(msg) = rx.recv().await {
                let msg_type: MsgType = from_str(msg.as_str()).unwrap();
                if msg_type.msg_type == "Movement" {
                    let parsed: WSMessageCoordinates = from_str(msg.as_str()).unwrap();
                    let code_guard = code.lock().await;
                    if code_guard.clone() == parsed.table_code {
                        msg_sender
                            .lock()
                            .await
                            .send(Message::Text(msg))
                            .await
                            .unwrap();
                    }
                } else {
                    let parsed: WSMessage = from_str(msg.as_str()).unwrap();
                    let code_guard = code.lock().await;
                    if code_guard.clone() == parsed.table_code {
                        msg_sender
                            .lock()
                            .await
                            .send(Message::Text(msg))
                            .await
                            .unwrap();
                    }
                }
            }
        })
    };

    let mut _update_matches = {
        let pg_sender = sender2.clone();
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
                if pg_sender
                    .lock()
                    .await
                    .send(Message::Text(wasd))
                    .await
                    .is_ok()
                {}
            }
        })
    };

    //Function that allows the websocket to receive a message
    let mut receive_msg = {
        tokio::spawn(async move {
            while let Some(Ok(msg)) = receiver.next().await {
                match msg {
                    //Print text.
                    Message::Text(t) => {
                        let test: MsgType = from_str(t.as_str()).unwrap();
                        let mut serialized = String::new();
                        //Handler for type of message CTable. This piece of code creates a row in our matches table.
                        match test.msg_type.as_str() {
                            /* This query will create a new row inside our database. Only the table code and the first player code will be filled at this point */
                            "CTable" => {
                                let mut parsed: WSMessage = from_str(t.as_str()).unwrap();

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
                                serialized = to_string(&parsed).unwrap();
                            }
                            //Handler for type of message JTable, basically controls how a user joins a table.
                            "JTable" => {
                                let mut parsed: WSMessage = from_str(t.as_str()).unwrap();
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
                                serialized = to_string(&parsed).unwrap();
                            }
                            //Handler for actually starting a match.
                            "Start" => {
                                let mut parsed: WSMessage = from_str(t.as_str()).unwrap();
                                let result = sqlx::query("SELECT * FROM matches WHERE code = $1")
                                    .bind(&parsed.table_code)
                                    .fetch_one(&state.lock().await.pool)
                                    .await
                                    .expect("Could not start match");
                                if !result.is_empty() {
                                    parsed.msg_type = String::from("Start");
                                }
                                serialized = to_string(&parsed).unwrap();
                            }
                            //Fired when a user makes a movement mid-match.
                            "Movement" => {
                                let parsed: WSMessageCoordinates = from_str(t.as_str()).unwrap();
                                serialized = to_string(&parsed).unwrap();
                            }
                            "Number" => {
                                let mut parsed: WSMessage = from_str(t.as_str()).unwrap();
                                let mut guard = team_number.lock().await;
                                let i = fastrand::usize(..9);
                                let number:usize = parsed.msg.parse::<usize>().unwrap();
                                let x = i.abs_diff(number);
                                parsed.msg = x.to_string();
                                *guard = x;
                                serialized = to_string(&parsed).unwrap();
                            }
                            "Team" => {
                                let guard = team_number.lock().await;
                                let mut parsed: WSMessage = from_str(t.as_str()).unwrap();
                                let mut numbers:Vec<u32> = parsed.msg.chars().map(|c| c.to_digit(10).unwrap()).collect();
                                numbers.sort();
                                if numbers[0] == *guard as u32 {
                                    parsed.msg = String::from("White")
                                } else {
                                    parsed.msg = String::from("Black")
                                }
                                serialized = to_string(&parsed).unwrap();
                            }
                            //Handler for Deleting matches from database..
                            "Delete" => {
                                let parsed: WSMessage = from_str(t.as_str()).unwrap();
                                sqlx::query("DELETE FROM matches WHERE code = $1;")
                                    .bind(&parsed.table_code)
                                    .execute(&state.lock().await.pool)
                                    .await
                                    .expect("Could not delete match from database.");
                                let mut code_guard = code.lock().await;
                                //Empties current table code state.
                                *code_guard = String::new();
                                serialized = to_string(&parsed).unwrap();
                            }
                            &_ => {
                                println!("Code not found");
                            }
                        }
                        // Serialize edited message to send it to client.
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
                        let code_guard = code.lock().await;
                        //If user had a table code when closing ws, it means they exited mid-match so we need to delete the match from our database.
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
    tokio::select! {
    _ = (&mut receive_msg) => {send_msg.abort()},
    _ = (&mut send_msg) => {receive_msg.abort()},
    };
}

//Terminates the web socket.
fn end_process() -> ControlFlow<(), ()> {
    ControlFlow::Break(())
}
