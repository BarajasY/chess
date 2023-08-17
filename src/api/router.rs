
use axum::{Router, routing::get};

use crate::api::{controllers::chess::handle_ws,  db::get_db_pool, state::make_state};

use super::controllers::chess::root;

//Router of our app.
pub async fn get_router() -> Router {
    let app_state = make_state().await;

    let testing = Router::new().route("/test", get(root)).with_state(get_db_pool().await);

    println!("Connected to database");
    Router::new()
    .route("/ws", get(handle_ws))
    .with_state(app_state)
    .nest("/test", testing)

}
