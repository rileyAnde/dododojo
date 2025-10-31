# Current api status: 
- [ ] create new user - In progress
- [ ] update an existing user
- [ ] delete a user
- [x] get a single user

## Json layout of a user account when making a new user
```json
{ "Username": "user2", "Password": "password123", "Level": 2, "Inventory": {}, "Primary_Deck": [1, 2, 3, 4], "Gyms_Owned": ["air", "earth"] }
```
Username:String - Username <br>

Password:String - Hashed password <br>

Level:Int - Current level <br>

Inventory:String - stored as a string but represents a dictionary/hashmap as {Card_ID:Quantity, ...} as types {Int:Int}<br>

Primary_Deck:String - Array/List of Card_ID's as [Int, Int,...]

Gyms_Owned:String - Array/List of gyms that are currently under control or owned by a user

## Json layout when making a get request for a single user
```json
[
    {
        "id": 1,
        "username": "testuser",
        "password": "testpass",
        "level": 1,
        "inventory": "[1,2,3]",
        "primary_deck": "[4,5,6]",
        "gyms_owned": "[\"fire\", \"water\"]",
        "created_at": "2025-10-30 23:48:10",
        "updated_at": "2025-10-30 23:48:10"
    }
]
```

Differences with first creating a new user is no need to include an id as the database autoincrements, same with created_at and updated_at.