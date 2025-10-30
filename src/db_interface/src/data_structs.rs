use serde::{Deserialize, Serialize};
use rusqlite::{Connection};
use std::sync::Mutex;


pub struct AppState {
    pub conn: Mutex<Connection>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub username: String,
    pub password: String,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct Card {
    pub card_id: i32,
    pub card_type: String,
    pub card_level: i32,
    pub card_color: String,
    pub card_fx: String,
}