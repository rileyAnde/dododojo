--INSERT INTO users (username, password) VALUES ('ryland', 'password123');

CREATE TABLE IF NOT EXISTS Users ( 
	ID INTEGER PRIMARY KEY AUTOINCREMENT, 
	Username TEXT UNIQUE NOT NULL, 
	Password TEXT NOT NULL,
	Level INT NOT NULL DEFAULT 1,
	Inventory TEXT NOT NULL DEFAULT '{}',  -- JSON: {card_id: quantity, ...}
	Primary_Deck TEXT NOT NULL DEFAULT '[]', -- JSON: [card_id, ...]
	Gyms_Owned TEXT NOT NULL DEFAULT '[]',  -- JSON: ["fire", "water", ...]
	Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
	);

CREATE TABLE IF NOT EXISTS Cards (
	Card_ID INTEGER PRIMARY KEY AUTOINCREMENT,
	Type TEXT NOT NULL,
	Level INTEGER NOT NULL,
	Color TEXT NOT NULL,
	FX TEXT
);

CREATE TABLE IF NOT EXISTS Gyms (
	Name TEXT PRIMARY KEY,
	Owner_Username TEXT DEFAULT '',
	Deck TEXT NOT NULL DEFAULT '[]' -- JSON: [card_id, ...]
);

-- Create table for gyms to hold what players deck
