use std::{fmt::format, net::SocketAddr, ops::ControlFlow, sync::Arc, vec};

use axum::{
    extract::{
        ws::{Message, WebSocket},
        ConnectInfo, State, WebSocketUpgrade,
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
    State(app_state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, addr, app_state))
}

pub async fn handle_socket(mut socket: WebSocket, addr: SocketAddr, state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.tx.subscribe();
    println!("{} connected to websocket", addr);

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            // In any websocket error, break loop.
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    let receive_msg = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            process_request(msg, addr, state.clone());
        }
    });
}

fn process_request(msg: Message, addr: SocketAddr, state:Arc<AppState>) -> ControlFlow<(), ()> {
    //Matching to find the type of message received.
    match msg {
        //Print text.
        Message::Text(t) => {
            println!("{}", t);
            let _ = state.tx.send(t).unwrap();
        }
        //Print binaries
        Message::Binary(b) => {
            println!("Received bytes {:?}", b);
        }
        //Pring ping
        Message::Ping(pi) => {
            println!("Received ping {:?}", pi);
        }
        //Pring pong
        Message::Pong(po) => {
            println!("Received pong {:?}", po);
        }
        //Close websocket request.
        Message::Close(c) => {
            println!("Closing connection");
            println!("{} closed connection", addr);
            return ControlFlow::Break(());
        }
    }
    ControlFlow::Continue(())
}
