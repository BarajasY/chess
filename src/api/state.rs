use std::{collections::HashSet, sync::{Mutex, Arc}};
use tokio::sync::broadcast;


pub struct AppState {
    pub user_set:Mutex<HashSet<String>>,
    pub tx: broadcast::Sender<String>
}

pub fn make_state() -> Arc<AppState> {
    let user_set = Mutex::new(HashSet::new());
    let (sender, receiver) = broadcast::channel(100);

    Arc::new(AppState {user_set, tx:sender})
}
