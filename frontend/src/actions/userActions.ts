import { User } from "../App";
import { Card } from "../game/battle";
import { expand_cards } from "../utils/cardLoader";



export async function get_user(username:string, password: string): Promise<User> {
    try{
        const response = await fetch(`http://localhost:3000/user/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-password': password   // backend must read req.headers['x-password']
                },
            })
        if (!response.ok){
            throw new Error('User return failed')
        }
        let result = await response.json()
        result = result.account
        console.log(result.inventory)
        console.log(result.primary_deck)
        const inventory = expand_cards(result.inventory)
        const primary_deck = expand_cards(result.primary_deck)
        const new_user: User = {
            id: result.id,
            username: result.username, 
            password: result.password,
            level: result.level,
            inventory: result.inventory,
            primaryDeck: result.primaryDeck,
            gymsOwned: result.gymsOwned
        }
        return new_user
    } catch (error){
        console.log(error)
        throw error
    }
}

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
        const account = await get_user(username, password) 
        return account
    }catch (error){
        console.log(error)
        throw error
    }
}

export async function update_PrimaryDeck(cur_user:User, new_Deck:Card[]) {
    try{
        if (!cur_user || !new_Deck){
            throw new Error("Missing info ")
        }
        const updateData = {updateData: { ...cur_user, primaryDeck: new_Deck }}
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
        console.log(result)
        
        const updated_user: User = {
            id: result.id,
            username: result.username, 
            password: result.password,
            level: result.level,
            inventory: result.inventory,
            primaryDeck: result.primaryDeck,
            gymsOwned: result.gymsOwned
        }
        return updated_user

    }catch(error){
        console.log(error)
        throw error
    }
}

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