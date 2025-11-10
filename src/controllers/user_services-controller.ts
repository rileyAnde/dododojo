//TODO: update routes to match updated rust routes

import { Request, Response } from 'express';
import { existing_Account, backend_Card, new_Account, frontend_Card } from '../models/accounts';
import bcrypt from 'bcrypt';
import { run } from 'node:test';

const hashPassword = (password: string): string => {
    let SALT_ROUNDS = 10;
    return bcrypt.hashSync(password, SALT_ROUNDS);
}

//controller functions for user services

//GET /user/:username - retrieve existing user data
export const getUserServices = async (req: Request, res: Response) => {
    //check for required data
    if (!req.params.userId) {
        return res.status(400).json({ message: 'Username is required' });
    }
    const userId = req.params.userId;
    //fetch user data from Rust service
    const rustResponse = await fetch(`http://localhost:8080/user/${userId}`);
    //handle Rust service not ok response
    if (rustResponse.status == 401) {
        return res.status(401).json({ message: 'Username Not Found' });
    } if (!rustResponse.ok) {
        return res.status(500).json({ message: 'Error communicating with Rust service' });
    }
    const rustData = await rustResponse.json();
    console.log('Rust service response:', rustData);
    //TODO: Confirm we don't need to process inventory and deck data further
    const accountData: existing_Account = {
        id: rustData.id,
        username: rustData.username,
        passwordHash: rustData.password,
        level: rustData.level,
        inventory: rustData.inventory,
        primaryDeck: rustData.primary_deck,
        gymsOwned: JSON.parse(rustData.gyms_owned),
        createdAt: new Date(rustData.created_at),
        updatedAt: new Date(rustData.updated_at),
    };
    return res.status(200).json({ account: accountData });
};

//POST /users - add a new user service
export const addUserService = async (req: Request, res: Response) => {
    //check for required data
    if (!req.body?.account?.username || !req.body?.account?.passwordHash) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    let passedInfo = req.body.account;
    const newAccount:new_Account = {
    username: passedInfo.username,
    passwordHash: hashPassword(passedInfo.passwordHash),
    level: 1,
    //TODO: initialize inventory and deck properly
    inventory: [],
    primaryDeck: [],
    gymsOwned: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    }
    const rustResponse = await fetch(`http://localhost:8080/createuser`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
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
function compressCards(cards: frontend_Card[]): backend_Card[] {
    const counts = new Map<number, number>();

    for (const card of cards) {
        counts.set(card.id, (counts.get(card.id) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([id, quantity]) => ({
        id,
        quantity
    }));
}

//PUT /user/:userId - update an existing user service
export const updateUserService = async (req: Request, res: Response) => {
    if (!req.params.userId || !req.body.updateData) {
        return res.status(400).json({ message: 'User ID and update data are required' });
    }
    //convert frontend_Card[] to backend_Card[]
    const newInventory: backend_Card[] = compressCards(req.body.updateData.inventory);
    const newPrimaryDeck: backend_Card[] = compressCards(req.body.updateData.primaryDeck);
    //construct updated account data
    const updateData: existing_Account = {
        id: Number(req.params.userId),
        username: req.body.updateData.username,
        passwordHash: req.body.updateData.passwordHash,
        level: Number(req.body.updateData.level),
        inventory: newInventory,
        primaryDeck: newPrimaryDeck,
        gymsOwned: req.body.updateData.gymsOwned,
        createdAt: new Date(req.body.updateData.createdAt),
        updatedAt: new Date(),
    }
    //send update to Rust service
    const rustResponse = await fetch(`http://localhost:8080/updateuser/${req.params.userid}`,{
        method: 'PUT',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(updateData)
    });
    if (!rustResponse.ok) {
        return res.status(500).json({ message: 'Error updating account' });
    }
    console.log('rustResponse:', rustResponse);
    console.log(`Updating account ${req.params.userId} with data:`, req.body.updateData);
    return res.status(200).json({ message: 'Service updated successfully' });
    
};

//DELETE /user/:userid - delete a user service
export const deleteUserService = async (req: Request, res: Response) => {
    if (req.params.userId ) {
        console.log('Deleting user with ID:', req.params.userId);
        const rustResponse = await fetch(`http://localhost:8080/deleteuser/${req.params.userId}`,{
            method: 'DELETE',
        });
        console.log('rustResponse:', rustResponse);
        if (!rustResponse.ok) {
            return res.status(500).json({ message: 'Error deleting account' });
        }
        return res.status(200).json({ message: 'Service deleted successfully' });
    } else {
        return res.status(400).json({ message: 'Invalid user ID' });
    } 
};


