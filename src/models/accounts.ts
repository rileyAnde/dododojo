//file for models that can be passed between frontend and backend

export interface Account {
    id: Int32Array;
    username: string;
    passwordHash: string;
    level: Int32Array;
    inventory: Map<string, number>;
    primaryDeck: Deck;
    gymsOwned: string[];
    createdAt: Date;
    updatedAt: Date;
    deck: Deck;
    GymsWon: string[];
}

interface Deck {
    cards: Card[];
}

interface Card {
    id: string;
    element: string;
    isPowerCard: boolean;
}
