use std::{net::SocketAddr, ops::ControlFlow, vec};

use axum::{extract::{WebSocketUpgrade, ConnectInfo, ws::{WebSocket, Message}}, response::IntoResponse};
use futures_util::StreamExt;
use tokio::process;

pub async fn root() -> String {
    String::from("Hello from rust")
}

pub async fn handle_ws (ws: WebSocketUpgrade, ConnectInfo(addr): ConnectInfo<SocketAddr>) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, addr))
}

pub async fn handle_socket (mut socket: WebSocket, addr: SocketAddr) {
    let test = Message::Text("Test".to_string());

    if socket.send(Message::Ping(vec![1,2,3])).await.is_ok(){
        println!("Pinged... {}", addr);
    };

    if let Some(msg) = socket.recv().await {
        dbg!(msg.unwrap());
    };

    socket.send(test).await.unwrap()

/*     let (mut sender, mut receiver ) = socket.split();

    let mut receive_msg = tokio::spawn(async move  {
        while let Some(Ok(msg)) = receiver.next().await {
            dbg!(msg);
        }
    }); */

}
