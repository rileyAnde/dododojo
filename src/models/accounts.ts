//file for models that can be passed between frontend and backend

export interface existing_Account {
    id: number;
    username: string;
    passwordHash: string;
    level: number;
    inventory: backend_Card[];  
    primaryDeck: backend_Card[]; 
    gymsOwned: string[]; 
}

export interface new_Account {
    Username: string;
    Password: string;
    Level?: number;
    Inventory?: backend_Card[];  
    primary_deck?: backend_Card[]; 
    gyms_owned?: string[];  
}

export interface backend_Card {
    id: number,
    quantity: number,
}

export interface frontend_Card {
    id: number,
    type: string,
    rank: number,
    color: string,
    fx: string,
}