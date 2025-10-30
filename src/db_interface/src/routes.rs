use actix_web::{get, web, HttpResponse, Responder};

use crate::data_structs::AppState;
use crate::queries;
use serde_json::Value;

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

#[get("/upload_cards")]
async fn upload_cards_http(data: web::Data<AppState>, json: web::Json<Value>) -> impl Responder {
    let mut conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    //println!("Received upload_cards request with data: {:?}", json);
    let json_value = json.into_inner();
    //println!("json: {:?}", json_value);
    match queries::upload_cards(&mut conn, json_value).await {
        Ok(_) => HttpResponse::Ok().body("Cards uploaded successfully"),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
    
}