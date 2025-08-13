import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get("/", (req, res, next) => {
    
    try{

        res.send("Perplexity Drive Backend Running");

    } catch (err) {

        next(err);

    }
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});