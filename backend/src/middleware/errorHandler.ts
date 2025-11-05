import { Request, Response, NextFunction } from 'express';

// Interface pour les erreurs personnalisées
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de gestion des erreurs
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Erreurs Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erreur de base de données',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Erreurs de validation
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erreur de validation',
      errors: err
    });
  }

  // Erreur par défaut
  console.error('❌ Erreur non gérée:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware pour les routes non trouvées
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} non trouvée`
  });
};

// Wrapper pour les fonctions async
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
