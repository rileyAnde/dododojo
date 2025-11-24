import { getGymServices, updateGymService } from "../controllers/gym_services-controller.js";
import express from 'express';


const gym_services= express.Router()

// authenticate user service routes
gym_services.get('/gyms', getGymServices);
gym_services.put('/gyms/:gymName', updateGymService);

export default gym_services;
