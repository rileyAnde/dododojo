/**
Functions: 
main:does routing for gym services (get, post, put, delete)
helper:none
Inputs: HTTP requests from frontend
Outputs: HTTP responses to frontend
Authors: Hannah Smith 
**/
import { addUserService, deleteUserService, getUserServices, updateUserService } from "../controllers/user_services-controller.js";
import express from 'express';
//routes for user services

const user_services = express.Router()

// authenticate user service routes
user_services.get('/user/:username', getUserServices);
user_services.post('/users', addUserService);
user_services.put('/user/:userId', updateUserService);
user_services.delete('/user/:userId', deleteUserService);

//export the user services router
export default user_services;

