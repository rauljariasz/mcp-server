import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoute from './routes/auth.routes';
import clientRoute from './routes/client.routes';
import dataRoute from './routes/data.routes';
import path from 'path';

dotenv.config();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  exposedHeaders: ['token'],
};

// Habilitar cors
app.use(cors(corsOptions));

// Usar json
app.use(express.json());

// Configurar Express para servir archivos estáticos
app.use('/ws/images', express.static(path.join(__dirname, '../images')));

// Rutas
app.use('/ws/auth', authRoute);
app.use('/ws/client', clientRoute);
app.use('/ws/data', dataRoute);

export default app;
