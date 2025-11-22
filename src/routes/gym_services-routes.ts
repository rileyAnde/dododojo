import express from 'express';
import { getGymServices, updateGymService } from '../controllers/gym_services-controller';

const gym_services= express.Router()

// authenticate user service routes
gym_services.get('/user/:username', getGymServices);
gym_services.put('/user/:userId', updateGymService);

export default gym_services;
