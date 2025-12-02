/**
Functions: 
main: does actions related to gyms this is the bridge between frontend and backend
--only two functions get gyms and update gym we never create or delete gyms from frontend
helper:none
Inputs: information about gyms from frontend, such as name, owner username, deck
Outputs: updated gym information to frontend
Authors: Hannah Smith 
**/
import { BackendGym, Gym } from "../components/MapScreen"
import { Card } from "../game/battle"

//
export async function get_gyms(): Promise<BackendGym[]> {
    try {
        const results = await fetch(`http://localhost:3000/gyms`)
        if (!results.ok){
            throw new Error("Issue fetching gyms ")
        }
        const response = await results.json()
        return response.gyms
    }catch (error){
        console.log(error)
        throw error
    }
}

export async function update_gym(cur_gym:Gym, new_user: string, new_Deck:Card[]): Promise<BackendGym> {
    try{
        if (!cur_gym || !new_Deck){
            throw new Error("Missing info ")
        }
        const updateData = {name: cur_gym.name, owner_username: new_user, deck: new_Deck }
        const response = await fetch(`http://localhost:3000/gyms/${cur_gym.name}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({updateData: updateData})
        })
        if (!response.ok){
            throw new Error ("Issue Processing ")
        }
        let result = await response.json()
        result = result.gym
        console.log(result)
        
        const updated_gym: Gym = {
            ...cur_gym,
            owner_username: result.owner_username, 
            deck: result.deck
        }
        return updated_gym
    }catch(error){
        console.log(error)
        throw error
    }
}