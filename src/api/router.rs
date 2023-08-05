use axum::{Router, routing::{get, post}};


use super::{controllers::chess::root, db::get_db_pool};

pub async fn get_router() -> Router {
    Router::new()
    .route("/", get(root))
    .with_state(get_db_pool)
}
