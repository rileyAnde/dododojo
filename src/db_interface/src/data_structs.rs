use serde::{Deserialize, Serialize};
use rusqlite::{Connection};
use std::sync::Mutex;


pub struct AppState {
    pub conn: Mutex<Connection>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetUser {
    pub id: i32,
    pub username: String,
    pub password: String,
    pub level: i32,
    pub inventory: String, //<CardID, Quantity> cant use HashMap directly with rusqlite
    pub primary_deck: String, // Array<i32> JSON array of Card IDs
    pub gyms_owned: String, // Array<String> JSON array of Gym names
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUser {
    pub username: String,
    pub password: String,
    pub level: i32,
    pub inventory: String, //<CardID, Quantity> cant use HashMap directly with rusqlite
    pub primary_deck: String, // Array<i32> JSON array of Card IDs
    pub gyms_owned: String, // Array<String> JSON array of Gym names
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Card {
    pub card_id: i32,
    pub card_type: String,
    pub card_level: i32,
    pub card_color: String,
    pub card_fx: String,
}