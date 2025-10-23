use actix_web::{get, web, HttpResponse, Responder};

use crate::data_structs::AppState;
use crate::queries;

#[get("/user/{username}")]
async fn get_one_user_http(data: web::Data<AppState>, path: web::Path<String>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let username = path.into_inner();
    
    match queries::get_one_user(&conn, username).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
}


#[get("/users")]
async fn get_users_http(data: web::Data<AppState>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    
    match queries::get_all_users(&conn).await {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
}