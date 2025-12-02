/**
Functions: 
main:does routing for gym services (get, update)
helper:none
Inputs: HTTP requests from frontend
Outputs: HTTP responses to frontend
Authors: Hannah Smith 
**/
import { getGymServices, updateGymService } from "../controllers/gym_services-controller.js";
import express from 'express';

//routes for gym services
const gym_services= express.Router()

// authenticate user service routes
gym_services.get('/gyms', getGymServices);
gym_services.put('/gyms/:gymName', updateGymService);

//export the gym services router
export default gym_services;
