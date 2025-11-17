import { addUserService, deleteUserService, getUserServices, updateUserService } from "../controllers/user_services-controller.js";
import express from 'express';
//routes for user services
const user_services = express.Router();
// authenticate user service routes
user_services.get('/user/:username', getUserServices);
user_services.post('/users', addUserService);
user_services.put('/user/:userId', updateUserService);
user_services.delete('/user/:userId', deleteUserService);
export default user_services;
//# sourceMappingURL=user_services-routes.js.map