import { User } from "../App";

export async function get_user(username:string, password: string): Promise<User> {
    try{
        const response = await fetch(`http://localhost:3000/user/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-password': password   // backend must read req.headers['x-password']
                },
            })
        const result: User = await response.json()
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
        await fetch(`http://localhost:3000/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(new_account)
        })
        const account = await get_user(username, password) 
        return account
    }catch (error){
        console.log(error)
        throw error
    }
}