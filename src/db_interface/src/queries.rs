"""
Functions: 
get_all_users_query:
    - Retrieves all users from the database
get_one_user_query:
    - Retrieves a single user by username from the database
create_user_query:
    - Inserts a new user into the database
update_user_query:
    - Updates an existing user's data in the database
delete_user_check_username_query:
    - Checks if a user exists by ID before deletion
delete_user_query:
    - Deletes a user by ID from the database
get_all_gyms_query:
    - Retrieves all gyms from the database
get_one_gym_query:
    - Retrieves a single gym by name from the database
update_gym_query:
    - Updates an existing gym's data in the database
    
Authors: Ryland Edwards
Creation Date: 10/20/2025
"""

use rusqlite::{Connection, Result as SqlResult};
use crate::data_structs::{GetUser, CreateUser, Gym};
// Function to get all users from the database
pub async fn get_all_users_query(conn: &Connection) -> SqlResult<Vec<GetUser>> {

    let mut stmt = conn.prepare("SELECT * FROM users")?;
    
    let users = stmt.query_map([], |row| { //map each row to GetUser struct
        Ok(GetUser {
            id: row.get("ID")?,
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
    
    let mut user_list = Vec::new(); //collect users into a vector
    for user in users { 
        user_list.push(user?); //unwrap each user
    }
    //println!("userlist: {:?}", user_list);
    Ok(user_list) //return user list
}

pub async fn get_one_user_query(conn: &Connection, username: String) -> SqlResult<GetUser> {
    let mut stmt = conn.prepare("SELECT * FROM users WHERE Username = ?1")?; //select user by username

    let user = stmt.query_row([username], |row| { //map row to GetUser struct
        Ok(GetUser { //construct GetUser from row
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
    
    Ok(user) //return user
}
// Function to create a new user in the database
pub async fn create_user_query(conn: &Connection, user: CreateUser) -> SqlResult<()> {
    let username = user.username;
    let password = user.password;
    let level = user.level;
    let inventory = user.inventory;
    let primary_deck = user.primary_deck;
    let gyms_owned = user.gyms_owned;

    // Insert the new user into the database
    conn.execute(
        "INSERT INTO users (Username, Password, Level, Inventory, Primary_Deck, Gyms_Owned, Created_At, Updated_At) 
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'), datetime('now'))",
        rusqlite::params![username, password, level, inventory, primary_deck, gyms_owned],
    )?;
    
    Ok(())
}

// Function to update an existing user in the database
pub async fn update_user_query(conn: &Connection, user: GetUser) -> SqlResult<()> {
    println!("\nUpdating user in queries: {:?}", user);
    let id = user.id;
    let username = user.username;
    let password = user.password;
    let level = user.level;
    let inventory = user.inventory;
    let primary_deck = user.primary_deck;
    let gyms_owned = user.gyms_owned;

    // Update the existing user in the database
    conn.execute(
        "UPDATE users 
        SET Username = ?1, Password = ?2, Level = ?3, Inventory = ?4, Primary_Deck = ?5, Gyms_Owned = ?6, Updated_At = datetime('now') 
        WHERE ID = ?7",
        rusqlite::params![username, password, level, inventory, primary_deck, gyms_owned, id],
    )?;

    Ok(())
}

// Function to check if a user exists by ID before deletion
pub async fn delete_user_check_username_query(conn: &Connection, id: i32) -> SqlResult<GetUser> {
    let mut stmt = conn.prepare("SELECT * FROM users WHERE ID = ?1")?;

    let user = stmt.query_row([id], |row| {
        Ok(GetUser {
            id: row.get("ID")?,
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

// Function to delete a user from the database
pub async fn delete_user_query(conn: &Connection, id: i32) -> SqlResult<()> {
    conn.execute(
        "DELETE FROM users WHERE id = ?1",
        rusqlite::params![id],
    )?;
    Ok(())
}


// Function to get all gyms from the database
pub async fn get_all_gyms_query(conn: &Connection) -> SqlResult<Vec<Gym>> {
    let mut stmt = conn.prepare("SELECT * FROM Gyms")?;
    
    let gyms = stmt.query_map([], |row| {
        Ok(Gym {
            name: row.get("Name")?,
            owner_username: row.get("Owner_Username")?,
            deck: row.get("Deck")?,
        })
    })?;
    
    let mut gym_list = Vec::new();
    for gym in gyms {
        gym_list.push(gym?);
    }
    Ok(gym_list)
}


// Function to get one gym from the database
pub async fn get_one_gym_query(conn: &Connection, name: String) -> SqlResult<Gym> {
    let mut stmt = conn.prepare("SELECT * FROM Gyms WHERE Name = ?1")?;

    let gym = stmt.query_row([name], |row| {
        Ok(Gym {
            name: row.get("Name")?,
            owner_username: row.get("Owner_Username")?,
            deck: row.get("Deck")?,
        })
    })?;
    
    Ok(gym)
}

// Function to update an existing gym in the database
pub async fn update_gym_query(conn: &Connection, gym: Gym) -> SqlResult<()> {
    println!("\nUpdating gym in queries: {:?}", gym);
    let name = gym.name;
    let owner_username = gym.owner_username;
    let deck = gym.deck;

    conn.execute(
        "UPDATE Gyms 
        SET Owner_Username = ?1, Deck = ?2
        WHERE Name = ?3",
        rusqlite::params![owner_username, deck, name],
    )?;

    Ok(())
}