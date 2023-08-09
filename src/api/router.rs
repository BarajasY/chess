use axum::{Router, routing::get};


use crate::api::{controllers::chess::handle_ws, state::make_state};

use super::{controllers::chess::root, db::get_db_pool};

pub async fn get_router() -> Router {

    println!("Connected to database");
    Router::new()
    .route("/", get(root))
    .route("/ws", get(handle_ws))
    .with_state(make_state())
    .with_state(get_db_pool)

}
