import { Router } from 'express';
import {
  createDossier,
  getAllDossiers,
  getDossierById,
  updateDossier,
  changeDossierStatut,
  getDossiersAtRisque
} from '../controllers/dossier.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Routes pour tous les utilisateurs authentifiés
router.get('/', getAllDossiers);
router.get('/at-risque', getDossiersAtRisque);
router.get('/:id', getDossierById);

// Routes pour consultants, coordinateurs et admins
router.post(
  '/',
  authorize(Role.CONSULTANT, Role.COORDINATEUR, Role.ADMIN),
  createDossier
);

router.patch(
  '/:id',
  authorize(Role.CONSULTANT, Role.COORDINATEUR, Role.ADMIN),
  updateDossier
);

router.post(
  '/:id/statut',
  authorize(Role.CONSULTANT, Role.COORDINATEUR, Role.ADMIN),
  changeDossierStatut
);

export default router;
