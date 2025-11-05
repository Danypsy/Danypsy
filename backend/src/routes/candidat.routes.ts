import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Ces routes seront implémentées plus tard
router.get('/', (req, res) => res.json({ message: 'Liste des candidats' }));
router.post('/', (req, res) => res.json({ message: 'Créer un candidat' }));
router.get('/:id', (req, res) => res.json({ message: 'Détails candidat' }));

export default router;
