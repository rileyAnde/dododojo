//TODO: update routes to match updated rust routes
import bcrypt from 'bcrypt';
const hashPassword = (password) => {
    let SALT_ROUNDS = 10;
    return bcrypt.hashSync(password, SALT_ROUNDS);
};
//controller functions for user services
//GET /user/:username - retrieve existing user data
export const getUserServices = async (req, res) => {
    //check for required data
    if (!req.params.username) {
        return res.status(400).json({ message: 'Username is required' });
    }
    const username = req.params.username;
    //fetch user data from Rust service
    const rustResponse = await fetch(`http://localhost:8080/user/${username}`);
    //handle Rust service not ok response
    if (rustResponse.status == 401) {
        return res.status(401).json({ message: 'Username Not Found' });
    }
    if (!rustResponse.ok) {
        return res.status(500).json({ message: 'Error communicating with Rust service' });
    }
    console.log('Hi Hannah from getUserServices');
    console.log('Rust service response:', rustResponse);
    const rustData = await rustResponse.json();
    console.log('Rust service response:', rustData);
    const userInputPassword = req.get("x-password");
    if (bcrypt.compareSync(userInputPassword || '', rustData.password) === false) {
        return res.status(401).json({ message: 'Incorrect Password' });
    }
    //TODO: Confirm we don't need to process inventory and deck data further
    const accountData = {
        id: rustData.id,
        username: rustData.username,
        password: rustData.password,
        level: rustData.level,
        inventory: rustData.inventory,
        primaryDeck: rustData.primary_deck,
        gymsOwned: JSON.parse(rustData.gyms_owned),
    };
    return res.status(200).json({ account: accountData });
};
//POST /users - add a new user service
export const addUserService = async (req, res) => {
    //check for required data
    if (!req.body?.account?.Username || !req.body?.account?.Password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    let passedInfo = req.body.account;
    const newAccount = {
        Username: passedInfo.Username,
        Password: hashPassword(passedInfo.Password),
        // level: 1,
        // inventory: [],
        // primaryDeck: [],
        // gymsOwned: [],
    };
    const rustResponse = await fetch(`http://localhost:8080/createuser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(newAccount)
    });
    console.log('New account created:', newAccount);
    const text = await rustResponse.text();
    console.log(text);
    console.log('rustResponse:', rustResponse);
    if (!rustResponse.ok) {
        return res.status(500).json({ message: 'Error with processing, try again' });
    }
    return res.status(200).json({ message: 'Account created successfully' });
};
//helper function to convert frontend_Card[] to backend_Card[]
function compressCards(cards) {
    const counts = new Map();
    for (const card of cards) {
        counts.set(card.id, (counts.get(card.id) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([id, quantity]) => ({
        id,
        quantity
    }));
}
//PUT /user/:userId - update an existing user service
export const updateUserService = async (req, res) => {
    if (!req.params.userId || !req.body.updateData) {
        return res.status(400).json({ message: 'User ID and update data are required' });
    }
    //convert frontend_Card[] to backend_Card[]
    const newInventory = compressCards(req.body.updateData.inventory);
    const newPrimaryDeck = compressCards(req.body.updateData.primaryDeck);
    //construct updated account data
    const updateData = {
        Username: req.body.updateData.username,
        Password: req.body.updateData.password,
        Level: Number(req.body.updateData.level),
        Inventory: newInventory,
        primary_deck: newPrimaryDeck,
        gyms_owned: req.body.updateData.gymsOwned,
    };
    //send update to Rust service
    const rustResponse = await fetch(`http://localhost:8080/updateuser/${req.params.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(updateData)
    });
    if (!rustResponse.ok) {
        return res.status(500).json({ message: 'Error updating account' });
    }
    console.log('rustResponse:', rustResponse);
    console.log(`Updating account ${req.params.userId} with data:`, req.body.updateData);
    return res.status(200).json({ message: 'Service updated successfully', updatedAccount: updateData });
};
//DELETE /user/:userid - delete a user service
export const deleteUserService = async (req, res) => {
    if (req.params.userId) {
        console.log('Deleting user with ID:', req.params.userId);
        const rustResponse = await fetch(`http://localhost:8080/deleteuser/${req.params.userId}`, {
            method: 'DELETE',
        });
        console.log('rustResponse:', rustResponse);
        if (!rustResponse.ok) {
            return res.status(500).json({ message: 'Error deleting account' });
        }
        return res.status(200).json({ message: 'Service deleted successfully' });
    }
    else {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
};
//# sourceMappingURL=user_services-controller.js.map