use std::sync::Arc;
use sqlx::PgPool;
use tokio::sync::broadcast;

use super::db::get_db_pool;

//State for our application. TX and RX allows us to receive messages in our broadcast channel. pool is the connection to our database.
pub struct AppState {
    pub tx: broadcast::Sender<String>,
    pub pool: PgPool
}

//Unites both broadcast channels, PG Pool and PG Listener.
pub async fn make_state() -> Arc<AppState> {
    let (sender, _receiver) = broadcast::channel(100);
    let pool = get_db_pool().await;

    Arc::new(AppState {
            pool,
            tx: sender,
        })
}

/* //TESTING WIP.
pub fn _chess_match_state(code: String) -> Arc<ChessMatchState> {
    let (sender, receiver) = broadcast::channel(2);

    Arc::new(ChessMatchState {
        code,
        tx: sender,
        rx: receiver,
    })
}
 */
