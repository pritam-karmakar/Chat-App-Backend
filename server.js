import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes.js';
import initModels from './models/index.js'; // import model initializer
const app = express();


const corsOptions = {
    origin: 'http://localhost:8000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Initialize Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes);

// Initialize Sequelize before starting server
(async () => {
    try {
        const models = await initModels(); // <-- run your function
        console.log('Sequelize models initialized and DB synced');

        // You can attach models globally if you want
        global.models = models;

        // Running Server
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (err) {
        console.error('❌ Failed to initialize Sequelize:', err);
    }
})();

