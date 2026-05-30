# Asteroids - Style Atari 2600

Un jeu **Asteroids** inspiré du classique de l'Atari 2600 (VCS), recréé en HTML5/JavaScript pour être jouable dans le navigateur.

## 🎮 Comment jouer

### Contrôles

| Touche | Action |
|--------|--------|
| **←** / **→** | Rotation du vaisseau (gauche/droite) |
| **↑** / **W** | Propulsion (avancer) |
| **ESPACE** | Tirer |
| **H** | Hyperspace (téléportation aléatoire) |
| **ÉCHAP** | Pause |
| **M** | Couper/remettre le son |

### Objectif

- **Détruire les astéroïdes** : Chaque astéroïde détruit rapporte des points
- **Survivre** : Évitez les collisions avec les astéroïdes
- **Passer les niveaux** : Détruyez tous les astéroïdes pour passer au niveau suivant
- **Utilisez l'hyperspace** : Pour échapper à une situation dangereuse (cooldown de 3 secondes)

### Système de points

- **Petit astéroïde** : 100 points
- **Moyen astéroïde** : 50 points
- **Grand astéroïde** : 25 points
- **Bonus de niveau** : 1000 × niveau

## 🚀 Installation et exécution

### Méthode 1 : Ouvrir directement dans le navigateur

1. Téléchargez ou clonez ce dépôt
2. Ouvrez le fichier `index.html` dans votre navigateur préféré
3. Cliquez sur "COMMENCER" pour démarrer le jeu

### Méthode 2 : Serveur local

Pour une meilleure expérience (surtout pour le son) :

```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js (si vous avez http-server)
npx http-server

# Avec PHP
php -S localhost:8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

## 📁 Structure du projet

```
asteroids_vcs2600/
├── index.html          # Page principale
├── style.css           # Styles CSS
├── README.md           # Documentation
├── js/
│   ├── utils.js        # Fonctions utilitaires
│   ├── audio.js        # Gestion des sons 8-bit
│   ├── entities.js     # Classes des entités (vaisseau, astéroïdes, etc.)
│   ├── game.js         # Logique principale du jeu
│   └── main.js         # Point d'entrée
└── sounds/             # (Optionnel) Fichiers sons
```

## 🎨 Caractéristiques du style Atari 2600

### Graphismes
- **Couleurs limitées** : Palette inspirée de l'Atari 2600 (noir, blanc, cyan, magenta, jaune, etc.)
- **Résolution basse** : Graphismes pixelisés pour simuler les limitations matérielles
- **Écran noir** : Fond noir avec des éléments colorés, comme l'original
- **Effets de clignotement** : Le vaisseau clignote lorsqu'il est invulnérable

### Gameplay
- **Wrap-around** : Sortie d'un côté de l'écran = entrée de l'autre côté
- **Inertie** : Le vaisseau continue de se déplacer même sans propulsion
- **Division des astéroïdes** : Les grands astéroïdes se divisent en plus petits
- **Hyperspace** : Téléportation aléatoire avec invulnérabilité temporaire

### Son
- **Sons 8-bit** : Générés avec l'API Web Audio pour simuler le son de l'Atari 2600
- **Effets sonores** : Propulsion, tir, explosion, hyperspace

## 🔧 Personnalisation

Vous pouvez modifier les paramètres du jeu dans `js/utils.js` :

```javascript
const GAME_CONSTANTS = {
    // Physique
    MAX_SPEED: 4,
    ACCELERATION: 0.15,
    FRICTION: 0.98,
    ROTATION_SPEED: 5,
    
    // Vaisseau
    SHIP_SIZE: 20,
    SHIP_INVULNERABILITY: 120,
    
    // Tirs
    BULLET_SPEED: 8,
    BULLET_LIFETIME: 60,
    
    // Astéroïdes
    ASTEROID_MIN_SIZE: 30,
    ASTEROID_MAX_SIZE: 80,
    ASTEROIDS_PER_LEVEL: 4,
    
    // Niveaux
    LEVEL_SPAWN_DELAY: 120,
    
    // Hyperspace
    HYPERSPACE_DELAY: 60,
    HYPERSPACE_COOLDOWN: 180
};
```

## 📊 High Score

Le jeu sauvegarde automatiquement votre **high score** dans le `localStorage` du navigateur. Il est affiché à la fin de la partie.

## 🎵 Sons

Les sons sont générés dynamiquement avec l'API Web Audio. Si vous préférez utiliser des fichiers audio réels, vous pouvez :

1. Placer des fichiers `.wav` ou `.mp3` dans le dossier `sounds/`
2. Modifier les chemins dans `index.html`
3. Commenter la génération de sons dans `js/audio.js`

## 🐞 Dépannage

### Le jeu ne s'affiche pas
- Vérifiez que JavaScript est activé dans votre navigateur
- Essayez un autre navigateur (Chrome, Firefox, Edge recommandés)

### Pas de son
- Vérifiez que le son n'est pas coupé dans le jeu (touche **M**)
- Assurez-vous que le volume du navigateur n'est pas à 0
- Certains navigateurs bloquent le son jusqu'à ce que l'utilisateur interagisse avec la page

### Le jeu est trop lent
- Réduisez le nombre d'astéroïdes par niveau
- Diminuez la taille du canvas
- Fermez d'autres onglets gourmands en ressources

## 📜 Licence

Ce projet est sous licence **MIT**. Vous êtes libre de l'utiliser, le modifier et le distribuer.

## 🎬 Captures d'écran

*(À ajouter après avoir testé le jeu)*

---

**Amusez-vous bien !** 🚀

*Inspiré du jeu original Asteroids (1979) par Atari, Inc.*
