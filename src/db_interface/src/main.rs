/*
Functions: 
main:
    - Establishes a connection to the SQLite database
    - Sets up an Actix-web HTTP server with CORS enabled
    - Defines routes for user and gym management

Inputs: HTTP requests from frontend
Outputs: HTTP responses to frontend
Authors: Ryland Edwards
Creation Date: 10/20/2025
*/

mod queries;
mod routes;
mod data_structs;

use actix_web::{web, App, HttpServer};
use actix_cors::Cors;
use rusqlite::Connection;//keep Connection
use std::sync::Mutex; //keep
use data_structs::AppState;

//main entry point for the server connection and route setup
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Connect to SQLite database
    let conn = Connection::open("src/db/mydb.db") 
        .expect("Failed to connect to the database"); 

    // Wrap the connection in a Mutex for thread safety
    let app_state = web::Data::new(AppState {
        conn : Mutex::new(conn),
    });
    // Start HTTP server
    HttpServer::new(move || {
        let cors = Cors::permissive(); // Allow all origins, methods, and headers
        App::new()
            .wrap(cors)
            .app_data(app_state.clone())
            .service(routes::get_users_http) //define all routes
            .service(routes::get_one_user_http)
            .service(routes::create_user_http)
            .service(routes::update_user_http)
            .service(routes::delete_user_http)
            .service(routes::get_gyms_http)
            .service(routes::update_gym_http)
    })
    .bind("172.232.9.56:8080")? //bind to localhost:3001
    .run()
    .await?;

    Ok(())
    }
