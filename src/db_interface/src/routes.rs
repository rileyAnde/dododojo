/*
Functions: 
get_one_user_http:
    - Handles HTTP GET requests to retrieve a single user by username
get_users_http:
    - Handles HTTP GET requests to retrieve all users from the database
get_gyms_http:
    - Handles HTTP GET requests to retrieve all gyms from the database
create_user_http:
    - Handles HTTP POST requests to create a new user
    - Accepts user data in JSON format and inserts it into the database
update_user_http:
    - Handles HTTP PUT requests to update an existing user's data
    - Compares existing data with new data and updates only if changes are detected
delete_user_http:
    - Handles HTTP DELETE requests to remove a user by ID
update_gym_http:
    - Handles HTTP PUT requests to update an existing gym's data
Authors: Ryland Edwards
Creation Date: 10/20/2025
*/

use actix_web::{post, put, delete, get, web, HttpResponse, Responder};

use crate::data_structs::{AppState, GetUser, CreateUser, Gym};
use crate::queries;
use serde_json::Value;


#[get("/user/{username}")] //get one user by username
async fn get_one_user_http(data: web::Data<AppState>, path: web::Path<String>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let username = path.into_inner();

    match queries::get_one_user_query(&conn, username).await { //call query function
        Ok(user) => HttpResponse::Ok().json(user), //return user as json
        Err(e) => HttpResponse::InternalServerError() //return error
            .body(format!("Database error: {}", e)),
    }
}

#[get("/users")] //get all users
async fn get_users_http(data: web::Data<AppState>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection

    match queries::get_all_users_query(&conn).await { //call query function
        Ok(users) => HttpResponse::Ok().json(users), //return users as json
        Err(e) => HttpResponse::InternalServerError() //return error
            .body(format!("Database error: {}", e)),
    }
}

#[get("/gyms")] //get all gyms
async fn get_gyms_http(data: web::Data<AppState>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection

    match queries::get_all_gyms_query(&conn).await { //call query function
        Ok(gyms) => HttpResponse::Ok().json(gyms), //return gyms as json
        Err(e) => HttpResponse::InternalServerError() //return error
            .body(format!("Database error: {}", e)),
    }
}

#[post("/createuser")]
async fn create_user_http(data: web::Data<AppState>, user_data: web::Json<Value>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let json_value = user_data.into_inner();

    //println!("Received create_user request with data: {:?}", json_value);
    
    let user = CreateUser { //construct CreateUser from json
        username: json_value["Username"].as_str().unwrap_or_default().to_string(),
        password: json_value["Password"].as_str().unwrap_or_default().to_string(),
        level: json_value["Level"].as_i64().unwrap_or(1) as i32,
        inventory: json_value["Inventory"].to_string(),
        primary_deck: json_value["Primary_Deck"].to_string(),
        gyms_owned: json_value["Gyms_Owned"].to_string(),
    };
    //println!("create_user data: {:?}", user);

    match queries::create_user_query(&conn, user).await { //call query function
        Ok(_) => HttpResponse::Ok().body("User created successfully"), //return success
        Err(e) => HttpResponse::InternalServerError() //return error
            .body(format!("Database error: {}", e)),
    }
}

#[put("/updateuser/{id}")] //update user by id
async fn update_user_http(data: web::Data<AppState>, path: web::Path<i32>, new_user_data: web::Json<Value>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let id = path.into_inner();
    let existing_user_data = new_user_data.clone(); //clone to get existing data for comparison

    println!("\n existing user {:?}", existing_user_data);
    let existing_user = match queries::get_one_user_query(&conn,
        existing_user_data["Username"].as_str().unwrap_or_default().to_string()).await {
        Ok(user) => user,
        Err(e) => return HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    };
    //println!("\n existing user from db {:?}", existing_user);

    let json_value = new_user_data; //get new data from json
    println!("\njson_value : {:?}", json_value); 
    let user = GetUser{ //construct GetUser from json
        id: id,
        username: json_value["Username"].as_str().unwrap_or_default().to_string(),
        password: json_value["Password"].as_str().unwrap_or_default().to_string(),
        level: json_value["Level"].as_i64().unwrap_or(1) as i32,
        inventory: json_value["Inventory"].to_string(),
        primary_deck: json_value["primary_deck"].to_string(),
        gyms_owned: json_value["Gyms_Owned"].to_string(),
        created_at: existing_user.created_at.clone(),
        updated_at: existing_user.updated_at.clone(),
    };
    println!("\n New user data for update: {:?}", user.primary_deck);

    //println!("\nReceived update_user request with data: {:?}", user);
    if existing_user == user { // compare existing and new data
        //println!("\nNo changes detected, user not updated");
        HttpResponse::Ok().body("No changes detected, user not updated") //return no changes
    } else { //if changes detected, update user
        match queries::update_user_query(&conn, user).await {
            Ok(_) => HttpResponse::Ok().body(format!("User data updated")), //return success
            Err(e) => HttpResponse::InternalServerError() //return error
                .body(format!("Database error: {}", e)),
        }
    }
}


#[delete("/deleteuser/{id}")] //delete user by id
async fn delete_user_http(data: web::Data<AppState>, path: web::Path<i32>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let id = path.into_inner();

    let _user = match queries::delete_user_check_username_query(&conn, id).await { //check if user exists
        Ok(user) => user, //user exists
        Err(_) => return HttpResponse::Ok().body("User not found"), //user not found
    };
    println!("\n Deleting user with id: {}", id);

    match queries::delete_user_query(&conn, id).await { //call delete query
        Ok(_) => HttpResponse::Ok().body("User successfully deleted"), //return success
        Err(e) => HttpResponse::InternalServerError() //return error
            .body(format!("Database error: {}", e)), 
    }
}



#[put("/gyms/{name}")] //update gym by name
async fn update_gym_http(data: web::Data<AppState>, path: web::Path<String>, json: web::Json<Value>) -> impl Responder {
    let conn = data.conn.lock().unwrap(); // Lock the mutex to get the connection
    let name = path.into_inner();
    let json_value = json.into_inner();

    //println!("\n json_value for update gym: {:?}", json_value);
    // Get the existing gym data
    let existing_gym = match queries::get_one_gym_query(&conn, name.clone()).await {
        Ok(gym) => gym,
        Err(_) => return HttpResponse::NotFound().body("Gym not found"),
    };
    //println!("\n existing gym from db {:?}", existing_gym);

    let updated_gym = Gym { //construct updated Gym from json
        name: existing_gym.name.clone(),
        owner_username: json_value["owner_username"].as_str().unwrap_or_default().to_string(),
        deck: json_value["deck"].as_str().unwrap_or_default().to_string(),
    };
    // Update the gym data with new values
    if existing_gym == updated_gym { // compare existing and new data
        return HttpResponse::Ok().body("No changes detected, gym not updated");
    } else { //if changes detected, update gym
        match queries::update_gym_query(&conn, updated_gym).await {
            Ok(_) => HttpResponse::Ok().body("Gym updated successfully"),
            Err(e) => HttpResponse::InternalServerError()
                .body(format!("Database error: {}", e)),
        }

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