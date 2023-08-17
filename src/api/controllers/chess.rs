//This file represents the code that will work whenever the match starts.
use std::{net::SocketAddr, ops::ControlFlow, sync::Arc};

use axum::{
    extract::{
        ws::{Message, WebSocket},
        ConnectInfo, State, WebSocketUpgrade,
    },
    response::IntoResponse, debug_handler,
};

use futures::{sink::SinkExt, stream::StreamExt};
use serde_json::from_str;
use sqlx::postgres::PgListener;
use tokio::sync::broadcast::Sender;

use crate::api::{
    db::get_listener,
    state::AppState,
};

#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct Test {
    id: i32,
    name: String,
}
#[derive(serde::Deserialize, serde::Serialize, Debug)]
pub struct ReceivedMessage {
    code: String,
    msg: String,
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
    State(app_state):State<Arc<AppState>>,
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
    let mut code: String = String::new();
    let mut copied_code = &code;

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
    let mut send_msg = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            let parsed:ReceivedMessage = from_str(msg.as_str()).unwrap();
            if parsed.msg_type == "Movement" && copied_code == parsed.code {
                // In any websocket error, break loop.
                if sender.send(Message::Text(msg)).await.is_err() {
                    break;
                }
            }
        }

        //Listens to notify/listen system in database.
/*         while let Ok(msg) = listener.recv().await {
            // In any websocket error, break loop.
            println!("Debugging!");
            let testingboop: Test = from_str(msg.payload()).unwrap();
            dbg!(&testingboop);
            dbg!(&testingboop.name);
            if sender
                .send(Message::Text(msg.payload().to_string()))
                .await
                .is_err()
            {
                break;
            }
        } */
    });


    //Function that fires when a message is received.
    let mut receive_msg = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            /* sqlx::query("INSERT INTO test (name) VALUES ($1);")
            .bind(msg.clone().into_text().unwrap())
            .execute(&pool)
            .await
            .unwrap(); */

            //Would not recommend to remove this function as it handles the procedure to exit a websocket.
            process_request(msg, addr, state.tx.clone(), &mut code);
        }
    });

    tokio::select! {
        _ = (&mut receive_msg) => send_msg.abort(),
        _ = (&mut send_msg) => receive_msg.abort(),
    };

}

fn process_request(
    msg: Message,
    addr: SocketAddr,
    tx: Sender<String>,
    code: &mut String
) -> ControlFlow<(), ()> {
    //Matching to find the type of message received.
    match msg {
        //Print text.
        Message::Text(t) => {

            let parsed:ReceivedMessage = from_str(t.as_str()).unwrap();
            if parsed.msg_type == "CTable" {
                *code = parsed.code;
            }
            let _ = tx.send(t);
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
