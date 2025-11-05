# Guide d'Installation et de Déploiement - Application AIF-CSP

## 🚀 Installation rapide avec Docker

### Prérequis
- Docker et Docker Compose installés
- Git

### Étapes

1. **Cloner le repository**
```bash
git clone <repository-url>
cd Danypsy
```

2. **Configurer les variables d'environnement**
```bash
# Backend
cp backend/.env.example backend/.env
# Éditer backend/.env et modifier les valeurs si nécessaire
```

3. **Lancer l'application avec Docker Compose**
```bash
docker-compose up -d
```

4. **Initialiser la base de données**
```bash
# Se connecter au container backend
docker exec -it aif-csp-backend sh

# Exécuter les migrations
npx prisma migrate deploy

# Créer un utilisateur admin (optionnel)
npx prisma db seed
```

5. **Accéder à l'application**
- Frontend : http://localhost:3001
- Backend API : http://localhost:3000
- Base de données : localhost:5432

## 🛠️ Installation locale (développement)

### Backend

1. **Installation des dépendances**
```bash
cd backend
npm install
```

2. **Configuration**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

3. **Base de données**
```bash
# Démarrer PostgreSQL localement ou via Docker
docker run --name postgres-aif -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Créer la base de données
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate
```

4. **Démarrer le serveur**
```bash
npm run dev
```

Le serveur démarre sur http://localhost:3000

### Frontend

1. **Installation des dépendances**
```bash
cd frontend
npm install
```

2. **Démarrer l'application**
```bash
npm run dev
```

L'application démarre sur http://localhost:3001

## 📊 Création du premier utilisateur

### Via API (Postman, curl, etc.)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aif-csp.fr",
    "password": "Admin123!",
    "nom": "Admin",
    "prenom": "Système",
    "role": "ADMIN"
  }'
```

### Connexion

1. Ouvrir http://localhost:3001
2. Se connecter avec :
   - Email : admin@aif-csp.fr
   - Mot de passe : Admin123!

## 🔧 Configuration avancée

### Variables d'environnement Backend

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/aif_csp"

# JWT
JWT_SECRET="votre_secret_jwt_tres_securise"
JWT_EXPIRES_IN="7d"

# Serveur
PORT=3000
NODE_ENV="development"

# Email (Nodemailer)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="votre_email@example.com"
SMTP_PASSWORD="votre_mot_de_passe"
EMAIL_FROM="noreply@aif-csp.fr"

# CORS
CORS_ORIGIN="http://localhost:3001"

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Fichiers
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
```

## 🗄️ Gestion de la base de données

### Migrations Prisma

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la base de données (développement)
npx prisma migrate reset
```

### Prisma Studio

Interface graphique pour gérer la base de données :

```bash
npx prisma studio
```

Accès : http://localhost:5555

## 🧪 Tests

### Backend

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend

```bash
cd frontend
npm test
npm run test:coverage
```

## 📦 Build de production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## 🐳 Déploiement Docker en production

### Build et déploiement

```bash
# Build les images
docker-compose build

# Démarrer en production
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### Sauvegarde de la base de données

```bash
# Backup
docker exec aif-csp-db pg_dump -U aifcsp aif_csp > backup.sql

# Restore
cat backup.sql | docker exec -i aif-csp-db psql -U aifcsp aif_csp
```

## 🔐 Sécurité

### Checklist production

- [ ] Changer JWT_SECRET en valeur aléatoire forte
- [ ] Utiliser HTTPS (certificat SSL)
- [ ] Configurer les CORS restrictifs
- [ ] Activer rate limiting
- [ ] Configurer les logs
- [ ] Utiliser des mots de passe forts pour PostgreSQL
- [ ] Ne jamais committer le fichier .env
- [ ] Activer le firewall
- [ ] Configurer les sauvegardes automatiques

## 🐛 Troubleshooting

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker logs aif-csp-backend

# Vérifier la connexion à la base de données
docker exec -it aif-csp-backend npx prisma db pull
```

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est démarré
docker ps | grep postgres

# Vérifier la DATABASE_URL dans .env
```

### Erreur CORS

- Vérifier CORS_ORIGIN dans backend/.env
- Doit correspondre à l'URL du frontend

### Port déjà utilisé

```bash
# Trouver le processus qui utilise le port
lsof -i :3000
lsof -i :3001

# Tuer le processus
kill -9 <PID>
```

## 📚 Documentation API

Une fois le backend démarré, la documentation Swagger est disponible sur :
http://localhost:3000/api-docs

## 🆘 Support

Pour toute question ou problème :
- Consulter la documentation complète dans /docs
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

## 📄 Licence

Propriétaire - Tous droits réservés
