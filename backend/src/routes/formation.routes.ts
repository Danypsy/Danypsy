import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => res.json({ message: 'Liste des formations' }));
router.post('/', (req, res) => res.json({ message: 'Créer une formation' }));

export default router;
