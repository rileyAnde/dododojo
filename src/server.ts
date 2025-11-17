import express from 'express';
import cors from 'cors';
import user_services from './routes/user_services-routes.js';


const app = express();

// Allow requests from your frontend
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use('/', user_services);

app.set('port', 3000);
app.listen(app.get('port'), () => {
    console.log('Node App Started');
});
