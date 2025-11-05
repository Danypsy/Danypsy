import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => res.json({ message: 'Liste des notifications' }));
router.patch('/:id/lue', (req, res) => res.json({ message: 'Marquer comme lue' }));

export default router;
