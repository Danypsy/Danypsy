import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import {
  StatutDossier,
  CheckpointType,
  MotifAIF,
  Role
} from '@prisma/client';
import { addDays, differenceInDays } from 'date-fns';

// Schéma de validation pour la création d'un dossier
const createDossierSchema = z.object({
  candidatId: z.string().cuid(),
  formationId: z.string().cuid().optional(),
  devisId: z.string().cuid().optional(),
  projetProfessionnel: z.string().min(50),
  justificationFormation: z.string().min(50),
  motifAIF: z.nativeEnum(MotifAIF),
  argumentaireAIF: z.string().min(200)
});

// Création d'un nouveau dossier
export const createDossier = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }

    const validatedData = createDossierSchema.parse(req.body);

    // Vérifier que le candidat existe
    const candidat = await prisma.candidat.findUnique({
      where: { id: validatedData.candidatId }
    });

    if (!candidat) {
      throw new AppError('Candidat non trouvé', 404);
    }

    // Générer un numéro de dossier unique
    const numero = `AIF-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Calculer la date J-21 (21 jours avant le début de la formation)
    const dateJ21 = addDays(new Date(), 21);

    // Créer le dossier
    const dossier = await prisma.dossier.create({
      data: {
        numero,
        candidatId: validatedData.candidatId,
        consultantId: req.user.id,
        formationId: validatedData.formationId,
        devisId: validatedData.devisId,
        statut: StatutDossier.BROUILLON,
        dateJ21,
        projetProfessionnel: validatedData.projetProfessionnel,
        justificationFormation: validatedData.justificationFormation,
        motifAIF: validatedData.motifAIF,
        argumentaireAIF: validatedData.argumentaireAIF,
        soldeCPF: candidat.soldeCPF,
        coutFormation: 0,
        ecartFinancement: 0,
        montantAIFDemande: 0,
        etapesValidation: {},
        justificationCentreFormation: ''
      },
      include: {
        candidat: {
          select: {
            id: true,
            user: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            },
            idFranceTravail: true
          }
        },
        consultant: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    // Créer les checkpoints initiaux du workflow
    await createInitialCheckpoints(dossier.id, dateJ21);

    // Créer les 25 items de la checklist
    await createChecklistItems(dossier.id);

    // Créer une notification pour le consultant
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'NOUVEAU_DOSSIER',
        titre: 'Nouveau dossier créé',
        message: `Le dossier ${numero} a été créé avec succès. Vous pouvez maintenant commencer à le remplir.`,
        dossierId: dossier.id
      }
    });

    res.status(201).json({
      status: 'success',
      data: { dossier }
    });
  }
);

// Récupération de tous les dossiers (avec filtres)
export const getAllDossiers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }

    const {
      statut,
      region,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Construction des filtres
    const where: any = {};

    // Filtrer par rôle
    if (req.user.role === Role.CONSULTANT) {
      where.consultantId = req.user.id;
    } else if (req.user.role === Role.COORDINATEUR && req.user.region) {
      // Les coordinateurs voient les dossiers de leur région
      where.consultant = {
        region: req.user.region
      };
    }
    // Les admins voient tout

    if (statut) {
      where.statut = statut;
    }

    // Récupération des dossiers
    const [dossiers, total] = await Promise.all([
      prisma.dossier.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { [sortBy as string]: order },
        include: {
          candidat: {
            select: {
              id: true,
              user: {
                select: {
                  nom: true,
                  prenom: true
                }
              },
              idFranceTravail: true
            }
          },
          consultant: {
            select: {
              nom: true,
              prenom: true,
              region: true
            }
          },
          formation: {
            select: {
              intitule: true,
              dureeHeures: true
            }
          },
          devis: {
            select: {
              numero: true,
              coutTotal: true,
              valideParCandidat: true
            }
          }
        }
      }),
      prisma.dossier.count({ where })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        dossiers,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  }
);

// Récupération d'un dossier par ID
export const getDossierById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }

    const { id } = req.params;

    const dossier = await prisma.dossier.findUnique({
      where: { id },
      include: {
        candidat: {
          include: {
            user: {
              select: {
                nom: true,
                prenom: true,
                email: true,
                telephone: true
              }
            }
          }
        },
        consultant: {
          select: {
            nom: true,
            prenom: true,
            email: true,
            region: true
          }
        },
        formation: true,
        devis: true,
        checkpoints: {
          orderBy: { ordre: 'asc' }
        },
        checklistItems: {
          orderBy: { numero: 'asc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        historiqueStatuts: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!dossier) {
      throw new AppError('Dossier non trouvé', 404);
    }

    // Vérifier les permissions
    if (
      req.user.role === Role.CONSULTANT &&
      dossier.consultantId !== req.user.id
    ) {
      throw new AppError('Accès non autorisé à ce dossier', 403);
    }

    res.status(200).json({
      status: 'success',
      data: { dossier }
    });
  }
);

// Mise à jour d'un dossier
export const updateDossier = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }

    const { id } = req.params;

    // Vérifier que le dossier existe et appartient au consultant
    const existingDossier = await prisma.dossier.findUnique({
      where: { id }
    });

    if (!existingDossier) {
      throw new AppError('Dossier non trouvé', 404);
    }

    if (
      req.user.role === Role.CONSULTANT &&
      existingDossier.consultantId !== req.user.id
    ) {
      throw new AppError('Accès non autorisé à ce dossier', 403);
    }

    const updateSchema = z.object({
      projetProfessionnel: z.string().optional(),
      justificationFormation: z.string().optional(),
      metierCible: z.string().optional(),
      codeROMECible: z.string().optional(),
      etapesValidation: z.any().optional(),
      justificationCentreFormation: z.string().optional(),
      soldeCPF: z.number().optional(),
      coutFormation: z.number().optional(),
      ecartFinancement: z.number().optional(),
      abondementOPCO: z.number().optional(),
      montantAIFDemande: z.number().optional(),
      motifAIF: z.nativeEnum(MotifAIF).optional(),
      argumentaireAIF: z.string().optional()
    });

    const validatedData = updateSchema.parse(req.body);

    const dossier = await prisma.dossier.update({
      where: { id },
      data: validatedData,
      include: {
        candidat: true,
        consultant: true,
        formation: true,
        devis: true
      }
    });

    res.status(200).json({
      status: 'success',
      data: { dossier }
    });
  }
);

// Changement de statut d'un dossier
export const changeDossierStatut = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }

    const { id } = req.params;
    const { statut, commentaire } = req.body;

    if (!Object.values(StatutDossier).includes(statut)) {
      throw new AppError('Statut invalide', 400);
    }

    const dossier = await prisma.dossier.findUnique({
      where: { id }
    });

    if (!dossier) {
      throw new AppError('Dossier non trouvé', 404);
    }

    // Vérifications des permissions
    if (
      req.user.role === Role.CONSULTANT &&
      dossier.consultantId !== req.user.id
    ) {
      throw new AppError('Accès non autorisé à ce dossier', 403);
    }

    // Mise à jour du statut
    const updatedDossier = await prisma.dossier.update({
      where: { id },
      data: {
        statut,
        ...(statut === StatutDossier.TRANSMIS && {
          dateTransmission: new Date()
        }),
        ...(statut === StatutDossier.ACCEPTE && {
          dateReponseGestionnaire: new Date()
        }),
        ...(statut === StatutDossier.REJETE && {
          rejete: true,
          dateRejet: new Date()
        })
      }
    });

    // Créer une entrée dans l'historique
    await prisma.historiqueStatut.create({
      data: {
        dossierId: id,
        ancienStatut: dossier.statut,
        nouveauStatut: statut,
        commentaire,
        modifiePar: req.user.id
      }
    });

    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: dossier.consultantId,
        type: 'CHANGEMENT_STATUT',
        titre: 'Changement de statut du dossier',
        message: `Le dossier ${dossier.numero} est passé de ${dossier.statut} à ${statut}`,
        dossierId: id
      }
    });

    res.status(200).json({
      status: 'success',
      data: { dossier: updatedDossier }
    });
  }
);

// Fonction utilitaire pour créer les checkpoints initiaux
async function createInitialCheckpoints(dossierId: string, dateJ21: Date) {
  const checkpoints = [
    {
      type: CheckpointType.ELIGIBILITE_AIF,
      ordre: 1,
      titre: 'Vérification éligibilité AIF',
      description: 'Vérifier que le projet est éligible au financement AIF-CSP',
      dateEcheance: addDays(new Date(), 2)
    },
    {
      type: CheckpointType.VALIDATION_DEVIS,
      ordre: 2,
      titre: 'Validation devis par le candidat',
      description: 'Le candidat doit valider le devis sur France Travail',
      dateEcheance: addDays(new Date(), 3)
    },
    {
      type: CheckpointType.CONSTITUTION_DOSSIER,
      ordre: 3,
      titre: 'Constitution du dossier complet',
      description: 'Collecter tous les documents nécessaires',
      dateEcheance: addDays(new Date(), 8)
    },
    {
      type: CheckpointType.INTEGRATION_SYSTEM,
      ordre: 4,
      titre: 'Intégration dans Prest@ppli',
      description: 'Vérifier que le devis est visible dans Prest@ppli',
      dateEcheance: addDays(new Date(), 11)
    },
    {
      type: CheckpointType.REMPLISSAGE_FORM,
      ordre: 5,
      titre: 'Remplissage formulaire Prest@ppli',
      description: 'Compléter tous les champs du formulaire',
      dateEcheance: addDays(new Date(), 16)
    },
    {
      type: CheckpointType.PRE_TRANSMISSION,
      ordre: 6,
      titre: 'Checklist 25 points',
      description: 'Validation exhaustive avant transmission',
      dateEcheance: addDays(dateJ21, -7)
    },
    {
      type: CheckpointType.TRANSMISSION,
      ordre: 7,
      titre: 'Transmission au gestionnaire',
      description: 'Envoyer le dossier au gestionnaire France Travail',
      dateEcheance: addDays(dateJ21, -2)
    },
    {
      type: CheckpointType.SUIVI_GESTIONNAIRE,
      ordre: 8,
      titre: 'Suivi réponse gestionnaire',
      description: 'Attendre et suivre la réponse du gestionnaire (15 jours théoriques)',
      dateEcheance: addDays(dateJ21, 13)
    }
  ];

  for (const checkpoint of checkpoints) {
    await prisma.checkpoint.create({
      data: {
        ...checkpoint,
        dossierId
      }
    });
  }
}

// Fonction utilitaire pour créer les 25 items de la checklist
async function createChecklistItems(dossierId: string) {
  const items = [
    // Section IDENTITE (5 items)
    { numero: 1, section: 'IDENTITE', titre: 'ID France Travail validé', description: 'ID France Travail présent, format correct (10 chiffres), identique dans tous les documents' },
    { numero: 2, section: 'IDENTITE', titre: 'Identité bénéficiaire exacte', description: 'Nom, prénom, accents respectés, identiques partout' },
    { numero: 3, section: 'IDENTITE', titre: 'Statut CSP confirmé', description: 'Bénéficiaire en CSP actif, dates début/fin identifiées' },
    { numero: 4, section: 'IDENTITE', titre: 'Consultant référent identifié', description: 'Nom consultant dans Fiche Instruction, identique partout' },
    { numero: 5, section: 'IDENTITE', titre: 'Numéro de commande LPR géré', description: 'N° LPR noté à titre informatif, ne pas confondre avec ID France Travail' },

    // Section FORMATION (6 items)
    { numero: 6, section: 'FORMATION', titre: 'Intitulé formation EXACT', description: 'Intitulé copié directement du devis, pas de modification' },
    { numero: 7, section: 'FORMATION', titre: 'Dates formation validées', description: 'Dates cohérentes entre devis, fiche, Prest@ppli' },
    { numero: 8, section: 'FORMATION', titre: 'Durée formation en heures', description: 'Nombre heures cohérent avec formation' },
    { numero: 9, section: 'FORMATION', titre: 'Détail modules formation', description: 'Description modules présente et détaillée dans le devis' },
    { numero: 10, section: 'FORMATION', titre: 'Centre formation identifié', description: 'Dénomination exacte, adresse, SIRET' },
    { numero: 11, section: 'FORMATION', titre: 'Coûts pédagogiques détaillés', description: 'Coût total, détail des coûts, pas de montant vague' },

    // Section PROJET (6 items)
    { numero: 12, section: 'PROJET', titre: 'Justification choix centre formation', description: 'Argumentaire écrit (minimum 3-4 lignes)' },
    { numero: 13, section: 'PROJET', titre: 'Argumentaire AIF explicite', description: 'Minimum 200 mots, structure complète (contexte, CPF, justification, conclusion)' },
    { numero: 14, section: 'PROJET', titre: 'Étapes validation projet détaillées', description: 'Énumération TOUTES étapes (enquête métier, BMO, ateliers) avec dates et acteurs' },
    { numero: 15, section: 'PROJET', titre: 'PSP aligné avec formation', description: 'Projet PSP cohérent avec formation proposée' },
    { numero: 16, section: 'PROJET', titre: 'ROME métier d\'origine', description: 'Code ROME à 4 caractères du dernier métier exercé' },
    { numero: 17, section: 'PROJET', titre: 'Catégorie emploi sélectionnée', description: 'Salariés, Indépendants ou Demandeurs d\'emploi' },

    // Section DOCUMENTS (6 items)
    { numero: 18, section: 'DOCUMENTS', titre: 'Devis validé par candidat', description: 'Candidat a accepté devis dans France Travail, email reçu' },
    { numero: 19, section: 'DOCUMENTS', titre: 'Fichiers convertis EN PDF', description: 'Tous documents en PDF (pas Word), fichiers < 2Mo' },
    { numero: 20, section: 'DOCUMENTS', titre: 'Fiche Instruction complète et signée', description: 'Tous champs remplis, signée par candidat et consultant' },
    { numero: 21, section: 'DOCUMENTS', titre: 'Demande de Gestion complète et signée', description: 'Tous champs remplis, signée' },
    { numero: 22, section: 'DOCUMENTS', titre: 'Copie devis format PDF', description: 'Devis intégral, qualité lecture excellente' },
    { numero: 23, section: 'DOCUMENTS', titre: 'Justificatif d\'adresse', description: 'Document récent (< 3 mois), nom et adresse visibles' },

    // Section COHERENCE (2 items)
    { numero: 24, section: 'COHERENCE', titre: 'Cohérence dates entre documents', description: 'Toutes les dates (formation, CSP, signatures) cohérentes' },
    { numero: 25, section: 'COHERENCE', titre: 'Cohérence ID France Travail partout', description: 'ID France Travail identique dans tous les documents' }
  ];

  for (const item of items) {
    await prisma.checklistItem.create({
      data: {
        ...item,
        dossierId,
        causeErreur: '',
        actionCorrective: ''
      }
    });
  }
}

// Récupération des dossiers à risque (deadline proche)
export const getDossiersAtRisque = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }

    const where: any = {
      statut: {
        in: [
          StatutDossier.BROUILLON,
          StatutDossier.EN_VALIDATION_DEVIS,
          StatutDossier.CONSTITUTION_DOCUMENTS,
          StatutDossier.INTEGRATION_PRESTAPPLI,
          StatutDossier.PRE_TRANSMISSION
        ]
      },
      dateJ21: {
        lte: addDays(new Date(), 10) // Moins de 10 jours avant J-21
      }
    };

    // Filtrer par rôle
    if (req.user.role === Role.CONSULTANT) {
      where.consultantId = req.user.id;
    } else if (req.user.role === Role.COORDINATEUR && req.user.region) {
      where.consultant = {
        region: req.user.region
      };
    }

    const dossiers = await prisma.dossier.findMany({
      where,
      include: {
        candidat: {
          select: {
            user: {
              select: {
                nom: true,
                prenom: true
              }
            },
            idFranceTravail: true
          }
        },
        consultant: {
          select: {
            nom: true,
            prenom: true
          }
        },
        formation: {
          select: {
            intitule: true
          }
        }
      },
      orderBy: { dateJ21: 'asc' }
    });

    // Calculer les jours restants pour chaque dossier
    const dossiersAvecDelai = dossiers.map(dossier => ({
      ...dossier,
      joursRestants: dossier.dateJ21
        ? differenceInDays(dossier.dateJ21, new Date())
        : null
    }));

    res.status(200).json({
      status: 'success',
      data: {
        dossiers: dossiersAvecDelai,
        count: dossiersAvecDelai.length
      }
    });
  }
);

export default {
  createDossier,
  getAllDossiers,
  getDossierById,
  updateDossier,
  changeDossierStatut,
  getDossiersAtRisque
};
