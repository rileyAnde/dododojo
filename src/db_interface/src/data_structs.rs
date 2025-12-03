/*
AppState: 
    - Holds a thread-safe SQLite connection using Mutex

GetUser: 
    - Represents a user retrieved from the database
    - Fields: id, username, password, level, inventory, primary_deck, gyms_owned, created_at, updated_at

CreateUser: 
    - Represents data needed to create a new user
    - Fields: username, password, level, inventory, primary_deck, gyms_owned

Gym: 
    - Represents a gym in the system

Authors: Ryland Edwards
Creation Date: 10/20/2025
*/
use serde::{Deserialize, Serialize};
use rusqlite::{Connection};
use std::sync::Mutex;


pub struct AppState {
    pub conn: Mutex<Connection>,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
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

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct Gym {
    pub name: String, // fire, water,...
    pub owner_username: String,
    pub deck: String, // Array<i32> JSON array of Card IDs
}
