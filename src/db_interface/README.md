#TODO Make schema for cards and decks for each user

#TODO Make methods to makes new users, add cards to a deck, and anything else.


using SQLite for database as it is built in for nearly everything

To test client_example.ts it has to be compiled into js (idk why thats what it told me)

run
```bash
npx tsc client_example.ts --outDir dist
```
make sure you cd directly to where the file is.

then you can run the rust http server to connect to (ill but an exe of it to actually run if you dont want to compile the rust directly)

if you do want to compile and have the rust toolchain for some reason run
```bash
cargo run
```
in the db_interface folder (you dont have to be in the src dir for rust)

Now you should have the http server running and the client_interface compiled so now you can run 
```bash
node dist/client_example.js
```
the output should be 
```
Users: [ { username: 'admin', password: 'securepassword' } ]
```
as there is only one user in the temp db currently.

# All Routes

### Get: /user/{username}

Expected Request HTTP Body: None

Expected Response HTTP Body:
```json
{
    "id": 12,
    "username": "han101",
    "password": "$2b$10$9MKbvO2lrpNC9PIGLRI2dOpVsggK0lccyxHOpKEU11NsytKig9gI.",
    "level": 2,
    "inventory": "{\"1\":2,\"2\":2,\"5\":11}",
    "primary_deck": "[1,2,3,4]",
    "gyms_owned": "[\"air\",\"earth\"]",
    "created_at": "2025-11-11 05:01:58",
    "updated_at": "2025-11-11 19:00:53"
}
```

### Get: /users

Expected Request HTTP Body: None

Expected Response HTTP Body:
```json
[
    {
        "id": 3,
        "username": "user3",
        "password": "password1234",
        "level": 4,
        "inventory": "{}",
        "primary_deck": "[1,2,3,4]",
        "gyms_owned": "[\"air\",\"earth\"]",
        "created_at": "2025-10-31 05:08:57",
        "updated_at": "2025-11-07 22:26:42"
    },
    {
        "id": 5,
        "username": "user6",
        "password": "password12346",
        "level": 10,
        "inventory": "{\"1\":1,\"2\":3}",
        "primary_deck": "[1,2,3,4]",
        "gyms_owned": "[\"air\",\"earth\"]",
        "created_at": "2025-11-04 20:29:25",
        "updated_at": "2025-11-04 20:29:25"
    }
]
```

### Get: /gyms

Expected Request HTTP Body: None

Expected Response HTTP Body:
```json
[
    {
        "name": "fire",
        "owner_username": "",
        "deck": "[]"
    },
    {
        "name": "water",
        "owner_username": "",
        "deck": "[]"
    },
    {
        "name": "ice",
        "owner_username": "",
        "deck": "[]"
    },
    {
        "name": "earth",
        "owner_username": "",
        "deck": "[]"
    },
    {
        "name": "air",
        "owner_username": "",
        "deck": "[]"
    }
]
```

### Post: /createuser

Expected Request HTTP Body:
```json
{
    "Username": "water_user",
    "Password": "password123",
    "Level": 2,
    "Inventory": {
        "1": 1,
        "2": 2,
        "5": 10
    },
    "Primary_Deck": [
        1,
        2,
        3,
        4
    ],
    "Gyms_Owned": [
        "water"
    ]
}
```

Expected Response HTTP Body:
```json
User created successfully
```

### Put: /updateuser/{id}

Expected Request HTTP Body:
```json
{
    "Username": "han101",
    "Password": "$2b$10$9MKbvO2lrpNC9PIGLRI2dOpVsggK0lccyxHOpKEU11NsytKig9gI.",
    "Level": 102,
    "Inventory": {
        "1": 2,
        "2": 2,
        "5": 11
    },
    "Primary_Deck": [
        1,
        2,
        3,
        4
    ],
    "Gyms_Owned": [
        "air",
        "earth"
    ]
}
```

Expected Response HTTP Body:
```json
User data updated
```

### Put: /gyms/{name}

Expected Request HTTP Body:
```json
    {
        "name": "fire",
        "owner_username": "owneruserman",
        "deck": "[1,2,15,4,465,3,10]"
    }
```

Expected Response HTTP Body:
```json
Gym updated successfully
```

### Delete: /deleteuser/{id}

Expected Request HTTP Body: None

Expected Response HTTP Body:
```json
User successfully deleted
```