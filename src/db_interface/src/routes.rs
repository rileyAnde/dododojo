use actix_web::{post, put, delete, get, web, HttpResponse, Responder};

use crate::data_structs::{AppState, GetUser, CreateUser};
use crate::queries;
use serde_json::Value;

#[get("/user/{username}")]
async fn get_one_user_http(data: web::Data<AppState>, path: web::Path<String>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let username = path.into_inner();
    
    match queries::get_one_user_query(&conn, username).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
}


#[post("/create_user")]
async fn create_user_http(data: web::Data<AppState>, user_data: web::Json<Value>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let json_value = user_data.into_inner();
    
    match queries::create_user_query(&conn, json_value).await {
        Ok(_) => HttpResponse::Ok().body("User created successfully"),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
}

#[put("/update_user/{username}")]
async fn update_user_http(data: web::Data<AppState>, path: web::Path<String>, user_data: web::Json<Value>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let username = path.into_inner();
    println!("Updating user: {}", user_data);
    let json_value = user_data.into_inner();
    println!("json_value: {:?}", json_value);
    match queries::update_user_query(&conn, username, json_value).await {
        Ok(_) => HttpResponse::Ok().body("User updated successfully"),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
}


#[delete("/delete_user/{username}")]
async fn delete_user_http(data: web::Data<AppState>, path: web::Path<String>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let username = path.into_inner();

    match queries::delete_user_query(&conn, username).await {
        Ok(_) => HttpResponse::Ok().body("User successfully deleted"),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
}

#[get("/users")]
async fn get_users_http(data: web::Data<AppState>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection

    match queries::get_all_users_query(&conn).await {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
}

// #[get("/upload_cards")]
// async fn upload_cards_http(data: web::Data<AppState>, json: web::Json<Value>) -> impl Responder {
//     let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
//     //println!("Received upload_cards request with data: {:?}", json);
//     let json_value = json.into_inner();
//     //println!("json: {:?}", json_value);
//     match queries::upload_cards(&conn, json_value).await {
//         Ok(_) => HttpResponse::Ok().body("Cards uploaded successfully"),
//         Err(e) => HttpResponse::InternalServerError()
//             .body(format!("Database error: {}", e)),
//     }
// }