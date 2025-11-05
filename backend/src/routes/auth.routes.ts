import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

export default router;
