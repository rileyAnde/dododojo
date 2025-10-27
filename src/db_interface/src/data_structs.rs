use serde::{Deserialize, Serialize};
use rusqlite::{Connection};
use std::sync::Mutex;


#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub username: String,
    pub password: String,
}

pub struct AppState {
    pub conn: Mutex<Connection>,
}