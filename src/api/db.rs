use std::env;

use sqlx::{PgPool, postgres::PgListener};

//Makes a posgreSQL pool connection using .ENV variables.
pub async fn get_db_pool() -> PgPool {
    let conn_string = env::var("CONN_STRING").expect("Error loading env variable");
    PgPool::connect(conn_string.as_str()).await.expect("Error connection to database")
}

pub async fn get_listener() -> PgListener {
    let conn_string = env::var("CONN_STRING").expect("Error loading env variable");

    PgListener::connect(&conn_string).await.unwrap()
}
