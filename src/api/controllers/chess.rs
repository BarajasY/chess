use std::{net::SocketAddr, ops::ControlFlow, vec, sync::Arc, fmt::format};

use axum::{
    extract::{
        ws::{Message, WebSocket},
        ConnectInfo, WebSocketUpgrade, State,
    },
    response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};

use crate::api::state::AppState;

pub async fn root() -> String {
    String::from("Hello from rust")
}

pub async fn handle_ws(
    ws: WebSocketUpgrade,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(app_state): State<Arc<AppState>>
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, addr, app_state))
}

pub async fn handle_socket(mut socket: WebSocket, addr: SocketAddr, state:Arc<AppState>) {
    /* let test = Message::Text("Test".to_string()); */

/*     if socket.send(Message::Ping(vec![1, 2, 3])).await.is_ok() {
        println!("Pinged... {}", addr);
    }; */

/*     if let Some(msg) = socket.recv().await {
        dbg!(msg.unwrap());
    }; */


    /* socket.send(test).await.unwrap(); */

    let mut rx = state.tx.subscribe();
    let (mut sender, mut receiver) = socket.split();

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            // In any websocket error, break loop.
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    let receive_msg =
    tokio::spawn(async move { while let Some(Ok(msg)) = receiver.next().await {
            let _ = state.tx.send("Hola".to_string());
            println!("Hola");
            process_request(msg, addr);
        } });

}

fn process_request(msg: Message, addr: SocketAddr) -> ControlFlow<(), ()> {
    //Matching to find the type of message received.
    match msg {
        //Print text.
        Message::Text(t) => {
            println!("{}", t);
        },
        //Print binaries
        Message::Binary(b) => {
            println!("Received bytes {:?}", b);
        },
        //Pring ping
        Message::Ping(pi) => {
            println!("Received ping {:?}", pi);
        },
        //Pring pong
        Message::Pong(po) => {
            println!("Received pong {:?}", po);
        },
        //Close websocket request.
        Message::Close(c) => {
            println!("Closing connection");
            println!("{} closed connection", addr);
            return ControlFlow::Break(());
        }
    }
    ControlFlow::Continue(())
}
