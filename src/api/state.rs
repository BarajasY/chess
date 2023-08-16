use std::sync::Arc;
use tokio::sync::broadcast;

//State for our application. TX and RX allows us to receive messages in our broadcast channel. pool is the connection to our database.
pub struct AppState {
    pub tx: broadcast::Sender<String>,
    pub rx: broadcast::Receiver<String>
}

//TESTING WIP.
pub struct ChessMatchState {
    pub code: String,
    pub tx: broadcast::Sender<String>,
    pub rx: broadcast::Receiver<String>,
}

//Unites both broadcast channels, PG Pool and PG Listener.
pub fn make_state() -> Arc<AppState> {
    let (sender, receiver) = broadcast::channel(100);

    Arc::new(AppState {
            tx: sender,
            rx: receiver,
        })
}

//TESTING WIP.
pub fn _chess_match_state(code: String) -> Arc<ChessMatchState> {
    let (sender, receiver) = broadcast::channel(2);

    Arc::new(ChessMatchState {
        code,
        tx: sender,
        rx: receiver,
    })
}
