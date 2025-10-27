//create controller for user services

import { Request, Response } from 'express';
import { Account } from '../models/accounts';
import bcrypt from 'bcrypt';


let mockAccount: Account = {
    id: '1',
    username: 'testuser',
    passwordHash: bcrypt.hashSync('password123', 10),
    createdAt: new Date(),
    updatedAt: new Date(),
    deck: {
        cards: []
    },
    GymsWon: []
};



const hashPassword = (password: string): string => {
    let SALT_ROUNDS = 10;
    return bcrypt.hashSync(password, SALT_ROUNDS);
}

//controller functions for user services

//GET /user/:username - retrieve user data
export const getUserServices = (req: Request, res: Response) => {
    const username = req.params.username;
    const userInputPassword = req.body?.password;

    if (!username || !userInputPassword) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username !== mockAccount.username) {
        return res.status(404).json({ message: 'User not found' });
    }

    const valid = bcrypt.compareSync(userInputPassword, mockAccount.passwordHash);
    if (!valid) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    return res.status(200).json({ account: mockAccount });
};

//POST /user/:username - add a new user service
export const addUserService = (req: Request, res: Response) => {
    let newAccount :Account = req.body.account;
    if (newAccount && newAccount.username && newAccount.passwordHash) {
        const userInputPassword = newAccount.passwordHash;
        newAccount.passwordHash = hashPassword(userInputPassword);
        //TODO: add account to database
        console.log('Adding account:', req.body.account);
        return res.status(201).json({ message: 'Account created successfully' });
    } else {
        return res.status(400).json({ message: 'Username and password are required' });
    }
};

//PUT /user/:userId - update an existing user service
export const updateUserService = (req: Request, res: Response) => {
    if (req.params.userId && req.body.updateData) { 
        //todo: update service in database
        console.log(`Updating account ${req.params.userId} with data:`, req.body.updateData);
        return res.status(200).json({ message: 'Service updated successfully' });
    } else {
        return res.status(400).json({ message: 'Invalid update data' });
    }
};

//DELETE /user/:userId - delete a user service
export const deleteUserService = (req: Request, res: Response) => {
    if (req.params.userId ) {
        //todo: delete service from database
        console.log(`Deleting account with ID: ${req.params.userId}`);
        return res.status(200).json({ message: 'Service deleted successfully' });
    } else {
        return res.status(400).json({ message: 'Invalid user ID' });
    } 
};


