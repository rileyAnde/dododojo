mod queries;
mod routes;
mod data_structs;

use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use rusqlite::Connection;//keep Connection
use std::sync::Mutex; //keep
use data_structs::AppState;

//TODO make update user data routes and queries
//TODO make delete user data routes and queries
//TODO make get current game state routes and queries

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Connect to SQLite database
    let conn = Connection::open("src/db/mydb.db")
        .expect("Failed to connect to the database");

    let app_state = web::Data::new(AppState {
        conn : Mutex::new(conn),
    });

    HttpServer::new(move || {
        let cors = Cors::permissive(); 
        App::new()
            .wrap(cors)
            .app_data(app_state.clone())
            .service(routes::get_users_http)
            .service(routes::get_one_user_http)
            .service(routes::create_user_http)
            .service(routes::update_user_http)
            .service(routes::delete_user_http)
            //.service(routes::login_http)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await?;

    Ok(())
    }
