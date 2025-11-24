
import { Request, Response } from 'express';
import { gym } from '../models/gyms.js';
import { compressCards } from './user_services-controller.js';

export const getGymServices = async (req: Request, res: Response) => {
    const rustResponse = await fetch(`http://localhost:8080/gyms`);
    if (!rustResponse.ok) {
        return res.status(500).json({ message: 'Error communicating with Rust service' });
    }
    const rustData = await rustResponse.json();
    console.log('Rust service response:', rustData);
    return res.status(200).json({ gyms: rustData });
};

export const updateGymService = async (req: Request, res: Response) => {
    if (!req.params.name){
        return res.status(400).json({ message: 'Gym name is required' });
    }
    const gymName = req.params.name;
    const updateData: gym =  {
        name: req.body.updateData.name,
        owner_username: req.body.updateData.owner_username,
        deck: compressCards(req.body.updateData.deck)
    }
    const rustResponse = await fetch(`http://localhost:8080/gyms/${gymName}`,{
        method: 'PUT',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(updateData)
    });
    if (!rustResponse.ok) {
        return res.status(500).json({ message: 'Error communicating with Rust service' });
    }
    return res.status(200).json({ gym: updateData });
};
