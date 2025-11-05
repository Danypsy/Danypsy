import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

// Schémas de validation
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  role: z.nativeEnum(Role),
  region: z.string().optional(),
  telephone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
});

// Fonction pour générer un token JWT
const generateToken = (userId: string, email: string, role: Role, region?: string) => {
  return jwt.sign(
    { id: userId, email, role, region },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Inscription
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validation des données
    const validatedData = registerSchema.parse(req.body);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 400);
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        nom: validatedData.nom,
        prenom: validatedData.prenom,
        role: validatedData.role,
        region: validatedData.region,
        telephone: validatedData.telephone
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        region: true,
        telephone: true
      }
    });

    // Génération du token
    const token = generateToken(
      user.id,
      user.email,
      user.role,
      user.region || undefined
    );

    res.status(201).json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  }
);

// Connexion
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validation des données
    const validatedData = loginSchema.parse(req.body);

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user || !user.isActive) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Génération du token
    const token = generateToken(
      user.id,
      user.email,
      user.role,
      user.region || undefined
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          region: user.region,
          telephone: user.telephone
        },
        token
      }
    });
  }
);

// Récupération du profil de l'utilisateur connecté
export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        region: true,
        telephone: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  }
);

// Mise à jour du profil
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }

    const updateSchema = z.object({
      nom: z.string().min(2).optional(),
      prenom: z.string().min(2).optional(),
      telephone: z.string().optional()
    });

    const validatedData = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        region: true,
        telephone: true
      }
    });

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  }
);

// Changement de mot de passe
export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }

    const changePasswordSchema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    });

    const validatedData = changePasswordSchema.parse(req.body);

    // Récupération de l'utilisateur avec le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérification du mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError('Mot de passe actuel incorrect', 401);
    }

    // Hash du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Mise à jour
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      status: 'success',
      message: 'Mot de passe modifié avec succès'
    });
  }
);
