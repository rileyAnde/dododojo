/**
Functions: 
main: does actions related to user accounts this is the bridge between frontend and backend
--two separate function for updating primary deck and inventory bc they will be updated separately always
helper:none
Inputs: information about user accounts from frontend, such as username, password, inventory, primary deck
Outputs: updated user account information to frontend
Authors: Hannah Smith 
**/
import { User } from "../App";
import { Card } from "../game/battle";
import { expand_cards } from "../utils/cardLoader";


//fetch user account from backend
export async function get_user(username:string, password: string): Promise<User> {
    try{
        const response = await fetch(`http://localhost:3000/user/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-password': password   // backend must read req.headers['x-password']
                },
            })
        //if response not ok throw error
        if (!response.ok){
            throw new Error('User return failed')
        }
        let result = await response.json()
        result = result.account
        // Check if inventory is a stringified array and parse it
        const inventory_raw = typeof result.inventory === 'string' 
            ? JSON.parse(result.inventory) 
            : result.inventory;
        console.log("inventory_raw", inventory_raw)
        // Check if inventory is a stringified array and parse it
        const primary_deck_raw = typeof result.primary_deck === 'string'
            ? JSON.parse(result.primary_deck)
            : result.primary_deck;
        //always expand inventory first if inventory is missing we will create starter deck
        const inventory = await expand_cards(
            Array.isArray(inventory_raw) ? inventory_raw : []
            );
        // Expand primary deck, if missing use inventory as fallback -- important for new accounts
        const primary_deck = primary_deck_raw ? await expand_cards( 
            Array.isArray(primary_deck_raw) ? primary_deck_raw : []
        ) : inventory;
        //construct user to return
        const new_user: User = {
            id: result.id,
            username: result.username,
            password: result.password,
            level: result.level,
            inventory: inventory ?? [],
            primaryDeck: primary_deck ?? [],
            gymsOwned: result.gymsOwned
        }
        console.log(new_user)
        //double check user has inventory and primary deck if not throw error to delete user
        // this is important for new accounts that fail to be created properly
        if (new_user.inventory.length == 0 || new_user.primaryDeck.length == 0){
            throw new Error(result.id)
        }
        //return new user object
        return new_user
    } catch (error: Error | any){
        //if error not related to user return delete user because it was not created properly
        if (error.message !== "User return failed"){
            await delete_user({id: error.message} as User)
        }

        console.log(error)
        throw error
    }
}

//create new user account in backend
export async function create_user(username:string, password: string): Promise<User|undefined> {
    try{
        
        const new_account = {account: {Username: username, Password: password}}
        const response = await fetch(`http://localhost:3000/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(new_account)
        })
        if (!response.ok){
            throw new Error('User creation failed')
        }
        //after creating user fetch the user to return full user object
        const account = await get_user(username, password) 
        return account
    }catch (error){
        console.log(error)
        throw error
    }
}
//update user primary deck only
export async function update_PrimaryDeck(cur_user:User, new_Deck:Card[]) {
    try{
        if (!cur_user || !new_Deck){
            throw new Error("Missing info ")
        }
        //update only primary deck
        const updateData = {updateData: { ...cur_user, primaryDeck: new_Deck }}
        console.log('inventory length in action:', cur_user.inventory.length);
        console.log('primaryDeck length in action:', cur_user.primaryDeck.length);
        console.log('updateData being sent:', updateData);
        const response = await fetch(`http://localhost:3000/user/${cur_user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
        })
        if (!response.ok){
            throw new Error ("Issue Processing ")
        }
        let result = await response.json()
        result = result.updatedAccount
        console.log('updatedAccount received:', result);

        const inventory_raw = typeof result.Inventory === 'string' 
            ? JSON.parse(result.Inventory) 
            : result.Inventory;
        // Check if inventory is a stringified array and parse it
        const primary_deck_raw = typeof result.primary_deck === 'string'
            ? JSON.parse(result.primary_deck)
            : result.primary_deck;
        //always expand inventory first if inventory is missing we will create starter deck
        const inventory = await expand_cards(
            Array.isArray(inventory_raw) ? inventory_raw : []
            );
        // Expand primary deck, if missing use inventory as fallback
        const primary_deck = primary_deck_raw ? await expand_cards( 
            Array.isArray(primary_deck_raw) ? primary_deck_raw : []
        ) : inventory;
        
        const updated_user: User = {
            id: cur_user.id,
            username: result.Username, 
            password: result.Password,
            level: result.Level,
            inventory: inventory ?? [],
            primaryDeck: primary_deck ?? [],
            gymsOwned: result.gymsOwned
        }
        console.log('inventory length in response:', updated_user.inventory.length);
        console.log('primaryDeck length in response:', updated_user.primaryDeck.length);
        console.log('updated user in update_PrimaryDeck:', updated_user);
        return updated_user

    }catch(error){
        console.log(error)
        throw error
    }
}

//update user inventory only
export async function update_Inventory(cur_user:User, new_Deck:Card[]) {
    try{
        if (!cur_user || !new_Deck){
            throw new Error("Missing info ")
        }
        const updateData = {updateData: { ...cur_user, inventory: new_Deck }}
        const response = await fetch(`http://localhost:3000/user/${cur_user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
        })
        console.log('Response from update_Inventory:', response);
        if (!response.ok){
            throw new Error ("Issue Processing ")
        }
        let result = await response.json()
        result = result.updatedAccount
        console.log('updatedAccount received:', result);

        const inventory_raw = typeof result.Inventory === 'string' 
            ? JSON.parse(result.Inventory) 
            : result.Inventory;
        // Check if inventory is a stringified array and parse it
        const primary_deck_raw = typeof result.primary_deck === 'string'
            ? JSON.parse(result.primary_deck)
            : result.primary_deck;
        //always expand inventory first if inventory is missing we will create starter deck
        const inventory = await expand_cards(
            Array.isArray(inventory_raw) ? inventory_raw : []
            );
        // Expand primary deck, if missing use inventory as fallback
        const primary_deck = primary_deck_raw ? await expand_cards( 
            Array.isArray(primary_deck_raw) ? primary_deck_raw : []
        ) : inventory;
        
        const updated_user: User = {
            id: cur_user.id,
            username: result.Username, 
            password: result.Password,
            level: result.Level,
            inventory: inventory ?? [],
            primaryDeck: primary_deck ?? [],
            gymsOwned: result.gymsOwned
        }
        return updated_user
    }catch(error){
        console.log(error)
        throw error
    }
}

//delete user account from backend
export async function delete_user(cur_user: User){
    try{
        if (!cur_user){
            throw new Error("Missing info")
        }
        const response = await fetch(`http://localhost:3000/user/${cur_user.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
        })
        if (!response.ok){
            throw new Error("Server issue please try again")
        }
    }catch(error){
        alert("Server issue please try again")
        throw error 
    }
}