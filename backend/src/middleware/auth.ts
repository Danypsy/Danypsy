import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { prisma } from '../config/database';
import { Role } from '@prisma/client';

// Extension de l'interface Request pour ajouter user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        region?: string;
      };
    }
  }
}

// Interface pour le payload JWT
interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  region?: string;
}

// Middleware d'authentification
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Récupération du token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token d\'authentification manquant', 401);
    }

    const token = authHeader.split(' ')[1];

    // Vérification du token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JwtPayload;

    // Vérification que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        region: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      throw new AppError('Utilisateur non trouvé ou inactif', 401);
    }

    // Ajout des informations de l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      region: user.region || undefined
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Token invalide', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expiré', 401));
    }
    next(error);
  }
};

// Middleware de vérification des rôles
export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Non authentifié', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Vous n\'avez pas les permissions nécessaires pour cette action',
          403
        )
      );
    }

    next();
  };
};

// Middleware de vérification de la région (pour consultants et coordinateurs)
export const checkRegion = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Non authentifié', 401));
  }

  // Les admins ont accès à toutes les régions
  if (req.user.role === Role.ADMIN) {
    return next();
  }

  // Pour les autres, vérifier qu'ils ont une région
  if (!req.user.region) {
    return next(
      new AppError('Région non définie pour cet utilisateur', 403)
    );
  }

  next();
};
