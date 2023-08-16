//This file represents the code that will work whenever the match starts.
use std::{net::SocketAddr, ops::ControlFlow, sync::Arc};

use axum::{
    extract::{
        ws::{Message, WebSocket},
        ConnectInfo, State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde_json::from_str;
use sqlx::{postgres::PgListener, PgPool};
use tokio::sync::broadcast::Sender;

use crate::api::{
    db::get_listener,
    state::{make_state, AppState},
};

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct Test {
    id: i32,
    name: String,
}
#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct ReceivedMessage {
    code: String,
    msg: String
}

//function for test purposes.
pub async fn root() -> String {
    String::from("Hello from rust")
}

//Iniital http handler, this function basically transforms our http request to a websocket connection.
pub async fn handle_ws(
    ws: WebSocketUpgrade,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(pool): State<PgPool>,
) -> impl IntoResponse {
    let listener = get_listener().await;
    let app_state = make_state();
    //Upgrades http request to websocket connection. Handshake is done automatically.
    ws.on_upgrade(move |socket| handle_socket(socket, addr, app_state, listener, pool))
}

//Actual websocket handler. One websocket will spawn per connection, so per client.
pub async fn handle_socket(
    socket: WebSocket,
    addr: SocketAddr,
    state: Arc<AppState>,
    mut listener: PgListener,
    pool: PgPool,
) {
    let mut code:String = String::new();
    //Socket splitting to both send and receive at the same time.
    let (mut sender, mut receiver) = socket.split();

    //Listen to postgreSQl test_event
    listener
        .listen("test_row_added")
        .await
        .expect("Could not listen to test_event yo");

    //Subscribing to our broadcast channel.
    let mut rx = state.tx.subscribe();
    println!("{} connected to websocket", addr);

    //Function fired when we want to send a message.
    let _send_task = tokio::spawn(async move {
        while let Ok(msg) = listener.recv().await {
            // In any websocket error, break loop.
            println!("Debugging!");
            let testingboop:Test = from_str(msg.payload()).unwrap();
            dbg!(&testingboop);
            dbg!(&testingboop.name);
            if sender.send(Message::Text(msg.payload().to_string())).await.is_err() {
                break;
            }
        }
    });

    //Function that fires when a message is received.
    let _receive_msg = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            let decoded_msg:ReceivedMessage = from_str(msg.clone().into_text().unwrap().as_str()).unwrap();
            code = decoded_msg.code;
            println!("{}", code);
            /* sqlx::query("INSERT INTO test (name) VALUES ($1);")
            .bind(msg.clone().into_text().unwrap())
            .execute(&pool)
            .await
            .unwrap(); */

            //Would not recommend to remove this function as it handles the procedure to exit a websocket.
            process_request(msg, addr, state.tx.clone());
        }
    });
}

fn process_request(msg: Message, addr: SocketAddr, tx: Sender<String>) -> ControlFlow<(), ()> {
    //Matching to find the type of message received.
    match msg {
        //Print text.
        Message::Text(t) => {
/*             println!("{}", t); */
            //Send message to clients.
/*             let _ = tx.send(t).unwrap(); */
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
            println!("Closing connection");
            println!("{} closed connection", addr);
            return ControlFlow::Break(());
        }
    }
    ControlFlow::Continue(())
}
