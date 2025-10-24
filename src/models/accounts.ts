//file for models that can be passed between frontend and backend

export interface Account {
    id: string;
    username: string;
    passwordHash: string;
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
