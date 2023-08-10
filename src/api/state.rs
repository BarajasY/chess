use std::sync::Arc;
use tokio::sync::broadcast;


pub struct AppState {
    pub tx: broadcast::Sender<String>,
    pub rx: broadcast::Receiver<String>
}

pub fn make_state() -> Arc<AppState> {
    let (sender, receiver) = broadcast::channel(100);

    Arc::new(AppState {tx:sender, rx:receiver})
}
