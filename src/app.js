import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from './middleware/auth.js'; // if using one
import authRoutes from './routes/auth.js';
import uploadRouter from './routes/upload.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/protected', authenticate, (req, res) => {
  res.json({ message: `Hello user ${req.user.userId}` });
});

app.use('/auth', authRoutes);
app.use('/upload', uploadRouter);

export default app;
