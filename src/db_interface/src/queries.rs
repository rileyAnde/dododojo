use rusqlite::{Connection, Result as SqlResult};
use crate::data_structs::User;
use serde_json;

// Function to get all users from the database
pub async fn get_all_users(conn: &Connection) -> SqlResult<Vec<User>> {
    // Use explicit column names instead of SELECT *
    let mut stmt = conn.prepare("SELECT * FROM users")?;
    
    let users = stmt.query_map([], |row| {
        Ok(User {
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

pub async fn get_one_user(conn: &Connection, username: String) -> SqlResult<User> {
    let mut stmt = conn.prepare("SELECT * FROM users WHERE username = ?1")?;
    
    let user = stmt.query_row([username], |row| {
        Ok(User {
            //id: row.get("id")?,
            username: row.get("Username")?,
            password: row.get("Password")?,
        })
    })?;
    
    Ok(user)
}

pub async fn upload_cards(conn: &mut Connection, cards_json: serde_json::Value) -> SqlResult<()> {
    // println!("upload_cards called with json: {:?}", cards_json);
    // println!("JSON type: {}", match &cards_json {
    //     serde_json::Value::Array(_) => "Array",
    //     serde_json::Value::Object(_) => "Object",
    //     serde_json::Value::String(_) => "String",
    //     _ => "Other"
    // });
    
    // If it's a string, parse it first
    let parsed_json = if let Some(json_str) = cards_json.as_str() {
        println!("Parsing JSON string...");
        serde_json::from_str(json_str).map_err(|_| rusqlite::Error::InvalidQuery)?
    } else {
        cards_json
    };
    
    // Handle if the JSON is a single object with a cards array inside
    let cards = if let Some(arr) = parsed_json.as_array() {
        arr
    } else if let Some(obj) = parsed_json.as_object() {
        // Try to find an array field in the object (common patterns: "cards", "data", etc.)
        obj.get("cards")
            .or_else(|| obj.get("data"))
            .or_else(|| obj.get("items"))
            .and_then(|v| v.as_array())
            .ok_or(rusqlite::Error::InvalidQuery)?
    } else {
        return Err(rusqlite::Error::InvalidQuery);
    };
    
    //println!("Found {} cards to upload", cards.len());
    
    for card in cards {
        let card_obj = card.as_object().ok_or(rusqlite::Error::InvalidQuery)?;
        println!("Processing card: {:?}", card_obj);
        
        let card_type = card_obj.get("Type").and_then(|v| v.as_str()).ok_or(rusqlite::Error::InvalidQuery)?;
        let card_level = card_obj.get("Level").and_then(|v| v.as_i64()).ok_or(rusqlite::Error::InvalidQuery)? as i32;

        let card_color = card_obj.get("Color").and_then(|v| v.as_str()).ok_or(rusqlite::Error::InvalidQuery)?;

        let card_fx = card_obj.get("FX").and_then(|v| v.as_str()).or_else(|| Some("None")).ok_or(rusqlite::Error::InvalidQuery)?;

        conn.execute(
            "INSERT OR REPLACE INTO cards (Type, Level, Color, FX) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![card_type, card_level, card_color, card_fx],
        )?;
    }
    
    println!("Successfully uploaded {} cards", cards.len());
    Ok(())
}