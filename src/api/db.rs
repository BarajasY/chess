use std::env;

use sqlx::PgPool;

pub async fn get_db_pool() -> PgPool {
    let conn_string = env::var("CONN_STRING").expect("Error loading env variable");

    PgPool::connect(conn_string.as_str()).await.expect("Error connection to database")
}
