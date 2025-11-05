# Application de Financement de Formations Professionnelles AIF-CSP

Application complète pour optimiser le processus de montage de dossiers de financement AIF (Aide Individuelle à la Formation) dans le cadre du CSP (Contrat de Sécurisation Professionnelle).

## 🎯 Objectifs

- **Réduire le délai de montage** : de 60 min à 40 min (-33%)
- **Diminuer le taux de rejet** : de 15-20% à < 5%
- **Augmenter l'acceptation en 1ère transmission** : de 75-80% à > 90%
- **Éliminer les erreurs de cohérence** : 100% de fiabilité

## 🏗️ Architecture

### Backend
- **Framework** : Node.js + Express + TypeScript
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Authentification** : JWT
- **Validation** : Zod
- **Génération PDF** : PDFKit

### Frontend
- **Framework** : React + TypeScript
- **UI Library** : Material-UI (MUI)
- **State Management** : Redux Toolkit
- **Routing** : React Router
- **Forms** : React Hook Form + Zod
- **API Client** : Axios

## 📦 Fonctionnalités principales

### Pour les Consultants CSP
- ✅ Gestion complète des dossiers candidats
- ✅ Workflow guidé (J-30 à J+6)
- ✅ Checklist interactive de 25 points
- ✅ Template harmonisé pour éviter les erreurs
- ✅ Génération automatique d'argumentaires AIF
- ✅ Alertes et notifications pour deadlines critiques
- ✅ Suivi en temps réel de l'avancement

### Pour les Candidats CSP
- ✅ Espace personnel simplifié
- ✅ Validation de devis en ligne
- ✅ Suivi de l'état du dossier
- ✅ Notifications automatiques

### Pour les Coordinateurs Régionaux
- ✅ Tableau de bord KPIs complet
- ✅ Analyse des rejets et tendances
- ✅ Identification des dossiers à risque
- ✅ Rapports mensuels automatisés
- ✅ Suivi de performance de l'équipe

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+ et npm
- PostgreSQL 14+
- Docker (optionnel)

### Installation

1. **Backend**
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

2. **Frontend**
```bash
cd frontend
npm install
npm start
```

### Avec Docker
```bash
docker-compose up -d
```

## 📊 Métriques et KPIs

- Délai moyen de montage
- Taux de rejet
- Taux d'acceptation en 1ère transmission
- Délai de traitement gestionnaire
- Taux d'urgence (< 10 jours avant J-21)
