/**
Functions: 
main:creates models that are used throughout the this part of the backend 
--often there is a frontend and backend version of the same model to account for differences in data structure
helper:none
Inputs: N/A
Outputs: N/A
Authors: Hannah Smith 
**/

//model interfaces for accounts that already exist in the database
//these have a id number 
export interface existing_Account {
    id: number;
    username: string;
    password: string;
    level: number;
    inventory: backend_Card[];  
    primaryDeck: backend_Card[]; 
    gymsOwned: string[]; 
}
//model interfaces for new accounts that are being created
//these do not have an id number yet
export interface new_Account {
    Username: string;
    Password: string;
    Level?: number;
    Inventory?: backend_Card[];  
    primary_deck?: backend_Card[]; 
    gyms_owned?: string[];  
}
//model interfaces for cards in backend format

export interface backend_Card {
    id: number,
    quantity: number,
}
//model interfaces for cards in frontend format
export interface frontend_Card {
    id: number,
    type: string,
    rank: number,
    color: string,
    fx: string,
}