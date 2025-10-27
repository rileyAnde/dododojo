-- CREATE TABLE IF NOT EXISTS users (
--     id SERIAL PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

--INSERT INTO users (username, password) VALUES ('ryland', 'password123');

-- SELECT * FROM users;

-- CREATE TABLE Users ( 
-- 	ID INTEGER PRIMARY KEY AUTOINCREMENT, 
-- 	Username TEXT UNIQUE NOT NULL, 
-- 	Password TEXT NOT NULL );

-- CREATE TABLE Cards (
-- 	Card_ID INTEGER PRIMARY KEY AUTOINCREMENT,
-- 	Type TEXT NOT NULL,
-- 	Level INTEGER NOT NULL,
-- 	Color TEXT NOT NULL,
-- 	FX TEXT
-- );

-- CREATE TABLE ActiveDeck (
-- 	User_ID INTEGER NOT NULL,
-- 	Card_ID INTEGER NOT NULL,
-- 	Position INTEGER NOT NULL CHECK(Position >= 1 AND Position <= 30),
-- 	PRIMARY KEY (User_ID, Position),
-- 	FOREIGN KEY (User_ID) REFERENCES Users(ID),
-- 	FOREIGN KEY (Card_ID) REFERENCES Cards(Card_ID)
-- );

-- CREATE TABLE UserInventory (
--     User_ID INTEGER NOT NULL,
--     Card_ID INTEGER NOT NULL,
--     Quantity INTEGER NOT NULL CHECK(Quantity >= 1),
--     PRIMARY KEY (User_ID, Card_ID),
--     FOREIGN KEY (User_ID) REFERENCES Users(ID),
--     FOREIGN KEY (Card_ID) REFERENCES Cards(Card_ID)
-- );

-- INSERT OR REPLACE INTO cards (Type, Level, Color, FX) VALUES
-- ('Warrior', 1, 'Red', 'Double Attack'),
-- ('Mage', 2, 'Blue', 'Spell Boost'),
-- ('Archer', 1, 'Green', 'Piercing Arrow');

SELECT * FROM cards;

-- DROP TABLE IF EXISTS cards;