import express from 'express';
import { login, register } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/login', login); // remove double /auth/auth/login
authRouter.post('/register', register); // 👈 new route


export default authRouter;
