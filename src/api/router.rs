use axum::{Router, routing::get};


use crate::api::{controllers::chess::handle_ws,  db::get_db_pool};

use super::controllers::chess::root;

//Router of our app.
pub async fn get_router() -> Router {
    let db_pool = get_db_pool().await;

/*     sqlx::migrate!("./migrations").run(&db_pool).await.expect("Error running migrations"); */

    println!("Connected to database");
    Router::new()
    .route("/", get(root))
    .route("/ws", get(handle_ws))
    //Since make_state is an async function (due to the nature of database connections) we need to await it.
    .with_state(get_db_pool().await)

}
