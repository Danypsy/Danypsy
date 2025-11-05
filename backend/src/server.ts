import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import dossierRoutes from './routes/dossier.routes';
import candidatRoutes from './routes/candidat.routes';
import formationRoutes from './routes/formation.routes';
import kpiRoutes from './routes/kpi.routes';
import notificationRoutes from './routes/notification.routes';

// Chargement des variables d'environnement
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Configuration des middlewares de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/candidats', candidatRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/notifications', notificationRoutes);

// Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📝 Environnement: ${process.env.NODE_ENV}`);
  console.log(`🔗 API disponible sur http://localhost:${PORT}/api`);
});

export default app;
