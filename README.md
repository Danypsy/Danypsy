# 💎 Hidden Job Market - Application de Recherche d'Emploi

Une application complète ultra-spécialisée pour exploiter le **marché caché de l'emploi** - les opportunités qui ne sont jamais publiées publiquement.

## 🎯 Pourquoi le Marché Caché ?

**70-85% des postes** sont pourvus sans jamais être publiés ! Cette application vous aide à :
- 🤝 Construire et gérer votre réseau professionnel stratégiquement
- 💎 Découvrir et tracker les opportunités cachées
- 🏢 Cibler les bonnes entreprises
- 📝 Gérer vos candidatures spontanées et référées
- 💬 Documenter toutes vos interactions de networking
- 📊 Analyser l'efficacité de votre approche

## ✨ Fonctionnalités Principales

### 🏢 Gestion des Entreprises Cibles
- Recherche et ciblage d'entreprises
- Niveaux d'intérêt et statuts de progression
- Liens vers LinkedIn et sites web
- Statistiques (contacts, opportunités, candidatures)

### 👥 Réseau Professionnel
- Base de contacts professionnels complète
- Force des relations (1-5 étoiles)
- Historique des contacts et suivis planifiés
- Tags et catégorisation
- Lien avec les entreprises cibles

### 💎 Opportunités Cachées
- Tracking des postes non publiés découverts via networking
- Source de découverte (contact, événement, rumeur)
- Niveaux de priorité
- Dates d'ouverture estimées
- Statuts de progression

### 📝 Candidatures
- Suivi des candidatures spontanées
- Gestion des candidatures référées
- Versions de CV et lettres de motivation
- Timeline complète (envoi → réponse → entretien → offre)
- Statistiques de conversion

### 💬 Interactions
- Journal de toutes les interactions professionnelles
- Types : emails, appels, réunions, LinkedIn, cafés, événements
- Notes et résultats
- Indicateurs de suivi requis

### 📊 Dashboard & Analytics
- Vue d'ensemble de votre recherche
- Statistiques en temps réel
- Taux de conversion candidatures référées vs spontanées
- Suivi des prochaines actions

## 🛠️ Stack Technique

### Backend
- **Node.js** + **Express** - API RESTful
- **SQLite** avec **better-sqlite3** - Base de données légère et performante
- **JWT** - Authentification (prêt pour production)
- **Helmet** - Sécurité
- **CORS** - Configuration cross-origin

### Frontend
- **React 18** - Interface utilisateur moderne
- **React Router** - Navigation
- **Axios** - Communication API
- **date-fns** - Gestion des dates
- **Recharts** - Visualisations (prêt pour analytics)

## 📦 Installation

### Prérequis
- Node.js 16+ et npm

### Backend

```bash
cd backend
npm install

# Initialiser la base de données
npm run init-db

# Lancer le serveur
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install

# Lancer l'application
npm start
```

L'application s'ouvre sur `http://localhost:3000`

## 📁 Structure du Projet

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration DB
│   │   ├── models/          # Modèles de données
│   │   ├── controllers/     # Logique métier
│   │   ├── routes/          # Routes API
│   │   ├── middleware/      # Auth, validation
│   │   └── server.js        # Point d'entrée
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/      # Composants réutilisables
    │   ├── pages/           # Pages de l'application
    │   ├── services/        # API calls
    │   ├── styles/          # CSS
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## 🚀 API Endpoints

### Contacts
- `GET /api/contacts` - Liste des contacts
- `POST /api/contacts` - Créer un contact
- `GET /api/contacts/:id` - Détails d'un contact
- `PUT /api/contacts/:id` - Modifier un contact
- `DELETE /api/contacts/:id` - Supprimer un contact
- `GET /api/contacts/followups` - Prochains suivis

### Entreprises
- `GET /api/companies` - Liste des entreprises
- `GET /api/companies/stats` - Avec statistiques
- `POST /api/companies` - Créer une entreprise
- `PUT /api/companies/:id` - Modifier une entreprise
- `DELETE /api/companies/:id` - Supprimer une entreprise

### Opportunités Cachées
- `GET /api/opportunities` - Toutes les opportunités
- `GET /api/opportunities/active` - Opportunités actives
- `POST /api/opportunities` - Créer une opportunité
- `PUT /api/opportunities/:id` - Modifier une opportunité
- `DELETE /api/opportunities/:id` - Supprimer une opportunité

### Candidatures
- `GET /api/applications` - Liste des candidatures
- `GET /api/applications/stats` - Statistiques
- `POST /api/applications` - Créer une candidature
- `PUT /api/applications/:id` - Modifier une candidature
- `DELETE /api/applications/:id` - Supprimer une candidature

### Interactions
- `GET /api/interactions` - Toutes les interactions
- `GET /api/interactions/contact/:contactId` - Par contact
- `POST /api/interactions` - Créer une interaction
- `DELETE /api/interactions/:id` - Supprimer une interaction

## 💡 Guide d'Utilisation

### 1. Démarrer votre Recherche

1. **Ajoutez vos entreprises cibles**
   - Identifiez 20-30 entreprises qui vous intéressent
   - Notez leur niveau d'intérêt (1-5 étoiles)

2. **Construisez votre réseau**
   - Ajoutez vos contacts existants
   - Identifiez les personnes à contacter dans vos entreprises cibles
   - Évaluez la force de chaque relation

3. **Documentez vos interactions**
   - Chaque email, appel, rencontre
   - Notez les résultats et prochaines étapes

### 2. Exploiter le Marché Caché

1. **Networking Actif**
   - Planifiez des cafés networking
   - Participez à des événements
   - Utilisez LinkedIn stratégiquement

2. **Découvrir les Opportunités**
   - Posez des questions sur les projets en cours
   - Identifiez les besoins non comblés
   - Ajoutez les opportunités découvertes

3. **Candidatures Stratégiques**
   - Privilégiez les candidatures référées
   - Personnalisez chaque approche
   - Suivez méticuleusement

### 3. Maximiser vos Chances

- **Force des Relations** : Cultivez des relations fortes (4-5 étoiles)
- **Suivi Régulier** : Utilisez les dates de suivi pour rester en contact
- **Documentation** : Notez tout pour référence future
- **Analyse** : Utilisez les stats pour identifier ce qui fonctionne

## 🔐 Sécurité

Pour la production :
1. Configurez un vrai système JWT avec secrets forts
2. Ajoutez validation des entrées utilisateur
3. Implémentez rate limiting
4. Utilisez HTTPS
5. Configurez variables d'environnement sécurisées

## 🎨 Personnalisation

Le code est modulaire et facilement extensible :
- Ajoutez de nouveaux champs dans les modèles
- Créez de nouvelles vues et statistiques
- Intégrez des APIs externes (LinkedIn, etc.)
- Ajoutez des notifications et rappels

## 📈 Prochaines Fonctionnalités

- 📧 Notifications par email pour les suivis
- 📱 Application mobile
- 🔗 Intégration LinkedIn API
- 🤖 Suggestions d'opportunités IA
- 📊 Analytics avancés
- 📅 Calendrier intégré
- 🎯 Templates d'emails et lettres

## 🤝 Contribution

Ce projet est open-source. Contributions bienvenues !

## 📝 License

MIT License - Voir LICENSE pour plus de détails

## 👨‍💻 Auteur

**Danypsy** - Passionné de machine learning et AI

---

**Bonne chance dans votre recherche sur le marché caché ! 🚀💼**

Le succès dans la recherche d'emploi vient à 80% du networking et du marché caché. Cette application vous donne tous les outils pour y exceller.
