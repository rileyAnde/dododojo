use rusqlite::{Connection, Result};

#[derive(Debug)]
struct User {
    //id: i32,
    username: String,
    password: String,
}

fn get_all_users(conn: &Connection) -> Result<Vec<User>> {
    // Use explicit column names instead of SELECT *
    let mut stmt = conn.prepare("SELECT id, username, password FROM users")?;
    
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

fn main() -> Result<()> {
    // Connect to SQLite database (creates it if it doesn't exist)
    let conn = Connection::open("db/mydb.db")?;
    
    // Create users table for demonstration
    // conn.execute(
    //     "CREATE TABLE IF NOT EXISTS users (
    //         id INTEGER PRIMARY KEY,
    //         name TEXT NOT NULL,
    //         password TEXT NOT NULL
    //     )",
    //     [],
    // )?;
    
    // Insert some example data
    // conn.execute(
    //     "INSERT INTO users (name, password) VALUES (?1, ?2)",
    //     ["Alice", "securepassword"],
    // )?;
    // conn.execute(
    //     "INSERT INTO users (name, password) VALUES (?1, ?2)",
    //     ["Bob", "securepassword"],
    // )?;
    
    // Call our SELECT * FROM users function
    let users = get_all_users(&conn)?;
    
    println!("All users:");
    for user in users {
        println!("Username: {:?}, Password: {:?}", user.username, user.password);
    }
    
    Ok(())
}
