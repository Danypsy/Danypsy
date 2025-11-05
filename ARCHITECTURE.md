# Architecture de l'Application AIF-CSP

## 📐 Vue d'ensemble

L'application AIF-CSP est une solution full-stack moderne pour gérer les dossiers de financement de formations professionnelles dans le cadre du Contrat de Sécurisation Professionnelle (CSP).

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Material-UI
│   (Port 3001)   │  Redux Toolkit pour la gestion d'état
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend       │  Node.js + Express + TypeScript
│   (Port 3000)   │  Prisma ORM + JWT Auth
└────────┬────────┘
         │ Prisma Client
         │
┌────────▼────────┐
│   PostgreSQL    │  Base de données relationnelle
│   (Port 5432)   │
└─────────────────┘
```

## 🎯 Objectifs de l'application

### Objectifs quantitatifs
- **Réduire le délai de montage** : de 60 min à 40 min (-33%)
- **Diminuer le taux de rejet** : de 15-20% à < 5%
- **Augmenter l'acceptation en 1ère transmission** : de 75-80% à > 90%
- **Éliminer les erreurs de cohérence** : 100% de fiabilité

### Fonctionnalités clés
1. **Workflow guidé** : Processus en 8 étapes (J-30 à J+6)
2. **Checklist de 25 points** : Validation exhaustive avant transmission
3. **Template harmonisé** : Source unique pour éviter les erreurs
4. **Génération automatique** : Argumentaires AIF pré-remplis
5. **Alertes intelligentes** : Notifications sur les deadlines critiques
6. **KPIs en temps réel** : Tableaux de bord pour coordinateurs

## 🏗️ Architecture Backend

### Stack technologique
- **Runtime** : Node.js 18+
- **Framework** : Express.js
- **Langage** : TypeScript
- **ORM** : Prisma
- **Base de données** : PostgreSQL 14+
- **Authentification** : JWT (jsonwebtoken)
- **Validation** : Zod
- **Génération PDF** : PDFKit

### Structure des dossiers

```
backend/
├── src/
│   ├── controllers/       # Logique des routes
│   │   ├── auth.controller.ts
│   │   ├── dossier.controller.ts
│   │   └── ...
│   ├── routes/           # Définition des routes
│   │   ├── auth.routes.ts
│   │   ├── dossier.routes.ts
│   │   └── ...
│   ├── middleware/       # Middlewares Express
│   │   ├── auth.ts       # Authentification JWT
│   │   └── errorHandler.ts
│   ├── services/         # Logique métier
│   ├── config/           # Configuration
│   │   └── database.ts
│   ├── types/            # Types TypeScript
│   └── server.ts         # Point d'entrée
├── prisma/
│   └── schema.prisma     # Schéma de base de données
├── tests/
├── package.json
└── tsconfig.json
```

### Modèle de données

#### Entités principales

1. **User** : Utilisateurs du système (consultants, candidats, coordinateurs, admins)
2. **Candidat** : Bénéficiaires CSP avec informations détaillées
3. **Dossier** : Dossiers de financement AIF-CSP
4. **Formation** : Formations professionnelles
5. **CentreFormation** : Organismes de formation
6. **Devis** : Devis de formation
7. **Checkpoint** : Étapes du workflow
8. **ChecklistItem** : Items de la checklist de validation
9. **Document** : Documents du dossier
10. **KPI** : Indicateurs de performance

#### Relations clés

```
User 1───N Dossier (consultant)
User 1───1 Candidat
Candidat 1───N Dossier
Dossier 1───1 Devis
Dossier 1───1 Formation
Dossier 1───N Checkpoint
Dossier 1───N ChecklistItem
Dossier 1───N Document
Formation N───1 CentreFormation
```

### API REST

#### Endpoints principaux

**Authentification**
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `PATCH /api/auth/profile` - Mise à jour profil
- `POST /api/auth/change-password` - Changement mot de passe

**Dossiers**
- `GET /api/dossiers` - Liste des dossiers (avec filtres)
- `GET /api/dossiers/:id` - Détails d'un dossier
- `POST /api/dossiers` - Création d'un dossier
- `PATCH /api/dossiers/:id` - Mise à jour d'un dossier
- `POST /api/dossiers/:id/statut` - Changement de statut
- `GET /api/dossiers/at-risque` - Dossiers à risque

**KPIs** (Coordinateurs/Admins uniquement)
- `GET /api/kpis` - KPIs globaux
- `GET /api/kpis/region/:region` - KPIs par région

### Sécurité

#### Authentification JWT
- Tokens stockés côté client (localStorage)
- Expiration configurable (défaut : 7 jours)
- Refresh automatique avant expiration

#### Autorisation par rôles
- **CONSULTANT** : Gère ses propres dossiers
- **CANDIDAT** : Accès à ses dossiers uniquement
- **COORDINATEUR** : Vue sur sa région
- **ADMIN** : Accès complet

#### Protections
- Rate limiting : 100 requêtes par 15 minutes
- Helmet.js : Headers de sécurité HTTP
- CORS configuré
- Validation Zod sur toutes les entrées
- Hash bcrypt pour les mots de passe (12 rounds)

## 🎨 Architecture Frontend

### Stack technologique
- **Framework** : React 18
- **Langage** : TypeScript
- **UI Library** : Material-UI (MUI)
- **State Management** : Redux Toolkit
- **Routing** : React Router v6
- **Forms** : React Hook Form + Zod
- **HTTP Client** : Axios
- **Build Tool** : Vite

### Structure des dossiers

```
frontend/
├── src/
│   ├── components/       # Composants réutilisables
│   │   ├── Layout.tsx
│   │   └── PrivateRoute.tsx
│   ├── pages/           # Pages de l'application
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DossierList.tsx
│   │   ├── DossierDetail.tsx
│   │   ├── ChecklistPage.tsx
│   │   └── KPIDashboard.tsx
│   ├── store/           # Redux store
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── dossierSlice.ts
│   │       └── notificationSlice.ts
│   ├── hooks/           # Custom hooks
│   │   └── redux.ts
│   ├── services/        # Services API
│   ├── types/           # Types TypeScript
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── package.json
└── vite.config.ts
```

### Gestion d'état Redux

#### Slices

1. **authSlice** : Authentification et utilisateur connecté
2. **dossierSlice** : Gestion des dossiers
3. **notificationSlice** : Notifications en temps réel

#### Flux de données

```
User Action → Dispatch → Async Thunk → API Call → Update State → Re-render
```

### Routing

```
/login                       # Page de connexion (public)
/                           # Redirection vers /dashboard
/dashboard                  # Tableau de bord principal
/dossiers                   # Liste des dossiers
/dossiers/create            # Création d'un dossier
/dossiers/:id               # Détails d'un dossier
/dossiers/:id/checklist     # Checklist de validation
/kpis                       # Tableau de bord KPIs (coordinateurs)
```

## 📊 Workflow des dossiers

### États d'un dossier

```
BROUILLON
    ↓
EN_VALIDATION_DEVIS
    ↓
CONSTITUTION_DOCUMENTS
    ↓
INTEGRATION_PRESTAPPLI
    ↓
PRE_TRANSMISSION
    ↓
TRANSMIS
    ↓
EN_ATTENTE_GESTIONNAIRE
    ↓
ACCEPTE / REJETE / DEMANDE_COMPLEMENT
```

### Checkpoints critiques

1. **J-30** : Éligibilité AIF (2 jours)
2. **J-28** : Validation devis candidat (CRITIQUE)
3. **J-23** : Constitution dossier complet (5 jours)
4. **J-20** : Intégration Prest@ppli
5. **J-19** : Remplissage formulaire Prest@ppli
6. **J-14** : Checklist 25 points (OBLIGATOIRE)
7. **J-7** : Transmission gestionnaire
8. **J-9 à J+6** : Suivi réponse (15 jours théoriques)

### Ligne rouge : J-21
Dernier jour de transmission obligatoire avant le début de la formation.

## 🔔 Système de notifications

### Types de notifications

- `NOUVEAU_DOSSIER` : Dossier créé
- `CHANGEMENT_STATUT` : Changement d'état du dossier
- `ALERTE_DEADLINE` : Deadline proche (< 10 jours)
- `VALIDATION_REQUISE` : Action requise du candidat
- `REPONSE_GESTIONNAIRE` : Réponse reçue
- `DEMANDE_COMPLEMENT` : Documents complémentaires demandés

### Déclencheurs automatiques

- Création de dossier
- Changement de statut
- Dossier à risque (< 10 jours avant J-21)
- Réponse gestionnaire

## 📈 KPIs et Métriques

### KPIs principaux

1. **Délai moyen de montage** : Temps entre création et transmission
2. **Taux de rejet** : % de dossiers rejetés
3. **Taux d'acceptation 1ère transmission** : % acceptés sans demande de complément
4. **Délai traitement gestionnaire** : Temps de réponse
5. **Taux d'urgence** : % de dossiers < 10 jours avant J-21

### Calcul et stockage

- Calcul mensuel automatique
- Stocké dans la table `KPI`
- Agrégé par région
- Historique conservé

## 🔐 Sécurité et conformité

### RGPD
- Consentement explicite
- Droit à l'oubli
- Exportation des données
- Pseudonymisation

### Sécurité des données
- Chiffrement en transit (HTTPS)
- Hash des mots de passe (bcrypt)
- Tokens JWT signés
- Validation côté serveur
- Protection CSRF

## 🚀 Performance et scalabilité

### Optimisations

- Pagination des résultats
- Index sur les colonnes fréquemment requêtées
- Cache Redis (à implémenter)
- Lazy loading des composants React
- Code splitting

### Scalabilité

- Architecture stateless (JWT)
- Séparation backend/frontend
- Base de données PostgreSQL scalable
- Possibilité de load balancing

## 🧪 Tests

### Backend
- Tests unitaires : Jest
- Tests d'intégration : Supertest
- Coverage : > 80%

### Frontend
- Tests unitaires : Vitest
- Tests de composants : React Testing Library
- Tests E2E : Cypress (à implémenter)

## 📦 Déploiement

### Environnements

- **Development** : localhost
- **Staging** : staging.aif-csp.fr
- **Production** : app.aif-csp.fr

### CI/CD

```
Git Push → GitHub Actions → Build → Tests → Docker Build → Deploy
```

### Monitoring

- Logs : Winston + Morgan
- Monitoring : Prometheus + Grafana (à implémenter)
- Alertes : Email + Slack

## 🔄 Évolutions futures

### Phase 2
- [ ] Génération automatique de PDF
- [ ] Signature électronique
- [ ] Intégration API France Travail
- [ ] Notifications SMS
- [ ] Export Excel des KPIs

### Phase 3
- [ ] Application mobile
- [ ] Intelligence artificielle pour l'argumentaire
- [ ] Prédiction du taux d'acceptation
- [ ] Chatbot assistant

## 📚 Ressources

### Documentation technique
- [Guide d'installation](GUIDE_INSTALLATION.md)
- [README principal](README.md)
- Documentation Prisma : https://www.prisma.io/docs
- Documentation Material-UI : https://mui.com

### Standards de code
- ESLint + Prettier
- Convention de nommage : camelCase
- Commits : Convention Conventional Commits

---

**Version** : 1.0.0
**Date** : Novembre 2025
**Auteurs** : Équipe de développement AIF-CSP
