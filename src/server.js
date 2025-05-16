import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
