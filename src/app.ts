import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoute from './routes/auth.routes';
import clientRoute from './routes/client.routes';

dotenv.config();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'https://rauljariasz.github.io',
  exposedHeaders: ['token'],
};

app.use(cors(corsOptions));

app.use(express.json());

// Rutas
app.use('/ws/auth', authRoute);
app.use('/ws/client', clientRoute);

export default app;
