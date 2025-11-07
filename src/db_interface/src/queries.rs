use rusqlite::{Connection, Result as SqlResult};
use crate::data_structs::{GetUser, CreateUser};
use serde_json;

// Function to get all users from the database
pub async fn get_all_users_query(conn: &Connection) -> SqlResult<Vec<GetUser>> {
    // Use explicit column names instead of SELECT *
    let mut stmt = conn.prepare("SELECT * FROM users")?;
    
    let users = stmt.query_map([], |row| {
        Ok(GetUser {
            id: row.get("id")?,
            username: row.get("Username")?,
            password: row.get("Password")?,
            level: row.get("Level")?,
            inventory: row.get("Inventory")?,
            primary_deck: row.get("Primary_Deck")?,
            gyms_owned: row.get("Gyms_Owned")?,
            created_at: row.get("Created_At")?,
            updated_at: row.get("Updated_At")?,
        })
    })?;
    
    let mut user_list = Vec::new();
    for user in users {
        user_list.push(user?);
    }
    
    Ok(user_list)
}

pub async fn get_one_user_query(conn: &Connection, id: i32) -> SqlResult<GetUser> {
    let mut stmt = conn.prepare("SELECT * FROM users WHERE id = ?1")?;

    let user = stmt.query_row([id], |row| {
        Ok(GetUser {
            id: row.get("id")?,
            username: row.get("Username")?,
            password: row.get("Password")?,
            level: row.get("Level")?,
            inventory: row.get("Inventory")?,
            primary_deck: row.get("Primary_Deck")?,
            gyms_owned: row.get("Gyms_Owned")?,
            created_at: row.get("Created_At")?,
            updated_at: row.get("Updated_At")?,
        })
    })?;
    
    Ok(user)
}

pub async fn create_user_query(conn: &Connection, user: CreateUser) -> SqlResult<()> {
    let username = user.username;
    let password = user.password;
    let level = user.level;
    let inventory = user.inventory;
    let primary_deck = user.primary_deck;
    let gyms_owned = user.gyms_owned;

    conn.execute(
        "INSERT INTO users (Username, Password, Level, Inventory, Primary_Deck, Gyms_Owned, Created_At, Updated_At) 
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'), datetime('now'))",
        rusqlite::params![username, password, level, inventory, primary_deck, gyms_owned],
    )?;
    
    Ok(())
}


pub async fn update_user_query(conn: &Connection, user: GetUser) -> SqlResult<()> {
    let id = user.id;
    let username = user.username;
    let password = user.password;
    let level = user.level;
    let inventory = user.inventory;
    let primary_deck = user.primary_deck;
    let gyms_owned = user.gyms_owned;

    conn.execute(
        "UPDATE users 
        SET Password = ?1, Level = ?2, Inventory = ?3, Primary_Deck = ?4, Gyms_Owned = ?5, Updated_At = datetime('now') 
        WHERE Username = ?6",
        rusqlite::params![password, level, inventory, primary_deck, gyms_owned, username],
    )?;

    Ok(())
}

pub async fn delete_user_query(conn: &Connection, id: i32) -> SqlResult<()> {
    conn.execute(
        "DELETE FROM users WHERE id = ?1",
        rusqlite::params![id],
    )?;
    Ok(())
}

pub async fn login_query(conn: &Connection) -> SqlResult<()> {
    // Implement login logic here
    Ok(())
}