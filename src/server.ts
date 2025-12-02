/**
Functions: 
main:starts the express server and sets up routing for the backend
helper:none
Inputs: HTTP requests from frontend
Outputs: HTTP responses to frontend
Authors: Hannah Smith 
**/
import express from 'express';
import cors from 'cors';
import user_services from './routes/user_services-routes.js';
import gym_services from './routes/gym_services-routes.js';


const app = express();

// Allow requests from your frontend
app.use(cors({
    origin: 'http://localhost:5173'
}));

// Middleware to parse JSON bodies
app.use(express.json());
// Use the imported routes
app.use('/', user_services);
app.use('/', gym_services);
// Start the server
app.set('port', 3000);
app.listen(app.get('port'), () => {
    console.log('Node App Started');
});
