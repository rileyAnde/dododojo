//file for models that can be passed between frontend and backend

export interface existing_Account {
    id: number|null;
    username: string;
    passwordHash: string;
    level: number;
    inventory: backend_Card[];  
    primaryDeck: backend_Card[]; 
    gymsOwned: string[]; 
    createdAt: Date;
    updatedAt: Date;
}
export interface new_Account {
    username: string;
    passwordHash: string;
    level: number;
    inventory: backend_Card[];  
    primaryDeck: backend_Card[]; 
    gymsOwned: string[]; 
    createdAt: Date;
    updatedAt: Date;
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