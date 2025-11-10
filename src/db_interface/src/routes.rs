use std::panic::Location;

use actix_web::{post, put, delete, get, web, HttpResponse, Responder};

use crate::data_structs::{AppState, GetUser, CreateUser, LoginInfo};
use crate::queries;
use serde_json::Value;

//TODO change from passing the json value to the queries to transoforming
// the json into the CreateUser and GetUser structs and passing those to the queries

#[get("/user/{id}")]
async fn get_one_user_http(data: web::Data<AppState>, path: web::Path<i32>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let id = path.into_inner();

    match queries::get_one_user_query(&conn, id).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
}


#[post("/createuser")]
async fn create_user_http(data: web::Data<AppState>, user_data: web::Json<Value>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let json_value = user_data.into_inner();

    println!("Received create_user request with data: {:?}", json_value);
    
    let user = CreateUser { 
        username: json_value["Username"].as_str().unwrap_or_default().to_string(),
        password: json_value["Password"].as_str().unwrap_or_default().to_string(),
        level: json_value["Level"].as_i64().unwrap_or(1) as i32,
        inventory: json_value["Inventory"].to_string(),
        primary_deck: json_value["Primary_Deck"].to_string(),
        gyms_owned: json_value["Gyms_Owned"].to_string(),
    };
    println!("create_user data: {:?}", user);

    match queries::create_user_query(&conn, user).await {
        Ok(_) => HttpResponse::Ok().body("User created successfully"),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
}

//TODO run get user at id then compare to changes before updating
#[put("/updateuser/{id}")]
async fn update_user_http(data: web::Data<AppState>, path: web::Path<i32>, new_user_data: web::Json<Value>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let id = path.into_inner();

    let existing_user = match queries::get_one_user_query(&conn, id).await {
        Ok(user) => user,
        Err(e) => return HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    };
    println!("\nExisting user data: {:?}", existing_user);

    let json_value = new_user_data;
    println!("\njson_value : {:?}", json_value);
    let user = GetUser{
        id: id,
        username: json_value["Username"].as_str().unwrap_or_default().to_string(),
        password: json_value["Password"].as_str().unwrap_or_default().to_string(),
        level: json_value["Level"].as_i64().unwrap_or(1) as i32,
        inventory: json_value["Inventory"].to_string(),
        primary_deck: json_value["Primary_Deck"].to_string(),
        gyms_owned: json_value["Gyms_Owned"].to_string(),
        created_at: existing_user.created_at.clone(),
        updated_at: existing_user.updated_at.clone(),
    };

    println!("\nReceived update_user request with data: {:?}", user);
    if existing_user == user {
        HttpResponse::Ok().body("No changes detected, user not updated")
    } else {
        match queries::update_user_query(&conn, user).await {
            Ok(_) => HttpResponse::Ok().body(format!("User data updated")),
            Err(e) => HttpResponse::InternalServerError()
                .body(format!("Database error: {}", e)),
        }
    }
}



#[delete("/deleteuser/{id}")]
async fn delete_user_http(data: web::Data<AppState>, path: web::Path<i32>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let id = path.into_inner();

    match queries::delete_user_query(&conn, id).await {
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

#[get("/login")]
async fn login_http(data: web::Data<AppState>, json: web::Json<Value>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let json_value = json.into_inner();

    let current_user = queries::get_one_user_query(&conn, json_value["username"].as_i64().unwrap_or(0) as i32).await;

    //data from frontend of what user put in form
    let user = LoginInfo {
        username: json_value["username"].as_str().unwrap_or_default().to_string(),
        password: json_value["password"].as_str().unwrap_or_default().to_string(),
    };
    match queries::login_query(&conn).await {
        Ok(_) => HttpResponse::Ok().body("Login successful"),
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