use rusqlite::{Connection, Result as SqlResult};
use crate::data_structs::User;





// Function to get all users from the database
pub async fn get_all_users(conn: &Connection) -> SqlResult<Vec<User>> {
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

pub async fn get_one_user(conn: &Connection, username: String) -> SqlResult<User> {
    let mut stmt = conn.prepare("SELECT * FROM users WHERE username = ?1")?;
    
    let user = stmt.query_row([username], |row| {
        Ok(User {
            //id: row.get("id")?,
            username: row.get("username")?,
            password: row.get("password")?,
        })
    })?;
    
    Ok(user)
}