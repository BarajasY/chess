use std::sync::Arc;
use sqlx::PgPool;
use tokio::sync::{broadcast, mpsc, Mutex};

use super::db::get_db_pool;

//State for our application. TX and RX allows us to receive messages in our broadcast channel. pool is the connection to our database.
pub struct AppState {
    pub tx: broadcast::Sender<String>,
    pub pool: PgPool,
    pub sctx: mpsc::Sender<String>,
    pub scrx: mpsc::Receiver<String>
}

//Unites both broadcast channels, PG Pool and PG Listener.
pub async fn make_state() -> Arc<Mutex<AppState>> {
    let (tx, rx) = mpsc::channel(5);
    let (sender, _receiver) = broadcast::channel(1000);
    let pool = get_db_pool().await;

    Arc::new(Mutex::new( AppState {
            pool,
            tx: sender,
            sctx: tx,
            scrx: rx
        }))
}
