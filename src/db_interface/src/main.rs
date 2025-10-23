mod queries;
mod routes;
mod data_structs;

use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use rusqlite::Connection;//keep Connection
use std::sync::Mutex; //keep
use data_structs::AppState;


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Connect to SQLite database
    let conn = Connection::open("src/db/mydb.db")
        .expect("Failed to connect to the database");

    let app_state = web::Data::new(AppState {
        conn : Mutex::new(conn),
    });

    let _ = HttpServer::new(move || {
        let cors = Cors::permissive(); //
        App::new()
            .wrap(cors)
            .app_data(app_state.clone())
            .service(routes::get_users_http)
            .service(routes::get_one_user_http)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await?;

    Ok(())
    }
