use api::router::get_router;

mod api;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    dotenvy::dotenv().expect("Could not load .env variables.");

    println!("Server now Running on port 8000");
    axum::Server::bind(&"0.0.0.0:8000".parse().unwrap())
        .serve(get_router().await.into_make_service())
        .await
        .unwrap();
}
