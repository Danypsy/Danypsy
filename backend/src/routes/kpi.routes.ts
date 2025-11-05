import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
router.use(authenticate);
router.use(authorize(Role.COORDINATEUR, Role.ADMIN));

router.get('/', (req, res) => res.json({ message: 'KPIs globaux' }));
router.get('/region/:region', (req, res) => res.json({ message: 'KPIs par région' }));

export default router;
