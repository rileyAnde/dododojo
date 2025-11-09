//routes for user services
import { getUserServices, addUserService, updateUserService, deleteUserService } from '../controllers/user_services-controller';
const express = require('express')
const user_services = express.Router()

// authenticate user service routes
user_services.get('/user/:userId', getUserServices);
user_services.post('/users', addUserService);
user_services.put('/user/:userId', updateUserService);
user_services.delete('/user/:userId', deleteUserService);

export default user_services;

