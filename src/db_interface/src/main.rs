use actix_web::{web, get, App, HttpServer, Responder, HttpResponse};
use actix_cors::Cors;
use rusqlite::{Connection, Result as SqlResult};
use serde::{Serialize, Deserialize};
use std::sync::Mutex;
#[derive(Debug, Serialize, Deserialize)]
struct User {
    //id: i32,
    username: String,
    password: String,
}

struct AppState {
    conn: Mutex<Connection>,
}

async fn get_all_users(conn: &Connection) -> SqlResult<Vec<User>> {
    // Use explicit column names instead of SELECT *
    let mut stmt = conn.prepare("SELECT * FROM users")?;
    
    let users = stmt.query_map([], |row| {
        Ok(User {
            //id: row.get("id")?,
            username: row.get("username")?,
            password: row.get("password")?,
        })
    })?;
    
    let mut user_list = Vec::new();
    for user in users {
        user_list.push(user?);
    }
    
    Ok(user_list)
}

#[get("/users")]
async fn get_users(data: web::Data<AppState>) -> impl Responder {
    let conn = data.conn.lock().unwrap();
    
    match get_all_users(&conn).await {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(e) => HttpResponse::InternalServerError()
            .body(format!("Database error: {}", e)),
    }
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Connect to SQLite database (creates it if it doesn't exist)
    let conn = Connection::open("src/db/mydb.db")
        .expect("Failed to connect to the database");

    let app_state = web::Data::new(AppState {
        conn : Mutex::new(conn),
    });

    let _ =HttpServer::new(move || {
        let cors = Cors::permissive();
        App::new()
            .wrap(cors)
            .app_data(app_state.clone())
            .service(get_users)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await;

    Ok(())
    }


    //Users/rylandedwards/Documents/GitHub/dododojo/src/db_interface/src/db/mydb.db