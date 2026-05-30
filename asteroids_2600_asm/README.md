# Asteroids pour Atari 2600 (VCS)

Une implémentation du classique **Asteroids** en **assembleur 6502** pour l'**Atari 2600 (VCS)**. Ce code est conçu pour fonctionner sur les émulateurs comme **Stella**, **RetroArch**, **Javatari**, et autres.

---

## 📋 **À propos du projet**

### Caractéristiques
- ✅ **Vaisseau contrôlable** : Rotation (gauche/droite), propulsion (haut)
- ✅ **Tirs** : Limités, avec durée de vie
- ✅ **Astéroïdes** : Mouvement aléatoire, rotation, division en plus petits
- ✅ **Collisions** : Vaisseau ↔ astéroïdes, tirs ↔ astéroïdes
- ✅ **Système de vies** : 3 vies, game over quand plus de vies
- ✅ **Niveaux** : Difficulté progressive
- ✅ **Sons 8-bit** : Propulsion, tir, explosion (via TIA)
- ✅ **Wrap-around** : Sortie d'un côté = entrée de l'autre
- ✅ **Hyperspace** : Téléportation aléatoire (à implémenter)

### Limitations de l'Atari 2600
- **Mémoire** : Seulement 128 octets de RAM
- **Sprites** : 8 sprites matériels maximum (P0-P7)
- **Couleurs** : 2 couleurs par sprite, palette limitée
- **Résolution** : 192 × 160 pixels (mais seulement 2 sprites par ligne)
- **CPU** : 6502 à 1.19 MHz (très lent par rapport aux standards modernes)

---

## 📁 **Structure du projet**

```
asteroids_2600_asm/
├── asteroids.asm      # Code source principal en 6502
├── build.bat          # Script de build pour Windows
├── build.sh           # Script de build pour Linux/macOS
├── README.md           # Ce fichier
└── asteroids.bin      # ROM compilée (à générer)
```

---

## 🔧 **Prérequis**

Pour assembler le code et créer la ROM, vous avez besoin d'un **assembleur 6502** compatible Atari 2600 :

### 1. **DASM** (Recommandé)
- **Site** : [https://dasm-assembler.github.io/](https://dasm-assembler.github.io/)
- **Installation** :
  - **Ubuntu/Debian** : `sudo apt-get install dasm`
  - **macOS** : `brew install dasm`
  - **Windows** : Télécharger depuis le site officiel

### 2. **py65** (Alternative)
- **Site** : [https://github.com/mnaberez/py65](https://github.com/mnaberez/py65)
- **Installation** : `pip install py65`

### 3. **cc65** (Alternative)
- **Site** : [https://cc65.github.io/](https://cc65.github.io/)
- Contient `as6502` (assembleur 6502)

---

## 🚀 **Compilation**

### Sur Windows
1. Ouvrez l'invite de commandes (`cmd`)
2. Allez dans le dossier du projet :
   ```cmd
   cd asteroids_2600_asm
   ```
3. Exécutez le script de build :
   ```cmd
   build.bat
   ```

### Sur Linux/macOS
1. Ouvrez un terminal
2. Allez dans le dossier du projet :
   ```bash
   cd asteroids_2600_asm
   ```
3. Rendez le script exécutable :
   ```bash
   chmod +x build.sh
   ```
4. Exécutez le script de build :
   ```bash
   ./build.sh
   ```

### Manuellement avec DASM
```bash
dasm asteroids.asm -f3 -oasteroids.bin
```

---

## 🎮 **Exécution**

Une fois la ROM compilée (`asteroids.bin`), vous pouvez la tester sur différents émulateurs :

### 1. **Stella** (Recommandé)
- **Site** : [https://stella-emulator.github.io/](https://stella-emulator.github.io/)
- **Installation** :
  - **Ubuntu** : `sudo apt-get install stella`
  - **macOS** : `brew install stella`
  - **Windows** : Télécharger depuis le site
- **Exécution** :
  ```bash
  stella asteroids.bin
  ```

### 2. **RetroArch**
- **Site** : [https://www.retroarch.com/](https://www.retroarch.com/)
- **Core** : `stella` ou `stella2014`
- **Exécution** :
  1. Copiez `asteroids.bin` dans votre dossier de ROMs
  2. Chargez le core Stella dans RetroArch
  3. Sélectionnez la ROM

### 3. **Javatari** (Émulateur en ligne)
- **Site** : [https://javatari.org/](https://javatari.org/)
- **Utilisation** :
  1. Téléchargez `asteroids.bin`
  2. Glissez-déposez le fichier dans Javatari

### 4. **Atari 2600 réel**
Si vous avez une **Atari 2600** avec un **Cuttle Cart**, **Harmony Cart**, ou **StellaDS** :
1. Copiez `asteroids.bin` sur votre carte
2. Insérez la carte dans votre Atari 2600
3. Sélectionnez la ROM

---

## 🎯 **Contrôles**

| Bouton | Action |
|--------|--------|
| **Joystick Gauche** | Rotation du vaisseau (gauche) |
| **Joystick Droite** | Rotation du vaisseau (droite) |
| **Joystick Haut** | Propulsion (avancer) |
| **Bouton Rouge** | Tirer |
| **SELECT** | Hyperspace (à implémenter) |
| **RESET** | Redémarrer le jeu |

---

## 📝 **Code Source**

### Organisation du code

Le code est organisé en plusieurs sections :

1. **Constants** : Définition des registres TIA et RIOT
2. **Variables RAM** : Variables de jeu ($80-$FF)
3. **Initialisation** : Routine `Reset` et initialisation
4. **Boucle principale** : `StartFrame` (VSYNC, VBLANK, visible scanlines, overscan)
5. **Logique du jeu** :
   - `UpdateGame` : Mise à jour de l'état du jeu
   - `UpdatePlayer` : Mouvement du vaisseau
   - `UpdateBullet` : Mouvement des tirs
   - `UpdateAsteroids` : Mouvement des astéroïdes
   - `CheckCollisions` : Détection des collisions
   - `SpawnAsteroids` : Génération d'astéroïdes
6. **Rendu** : `DrawScanline` (affichage de chaque ligne)
7. **Son** : `UpdateSound` (gestion des sons TIA)
8. **Entrées** : `ReadJoystick` (lecture du joystick)

### Astuces de développement

#### Gestion de la mémoire
- **RAM** : Seulement 128 octets ($80-$FF)
- **ROM** : 4 Ko maximum ($F000-$FFFF)
- **Utilisez des variables partagées** pour économiser de la RAM
- **Évitez les sous-routines récursives** (pas de pile suffisante)

#### Optimisations
- **Décalage de bits** : Utilisez `ASL`, `LSR` pour multiplier/diviser par 2
- **Tables de lookup** : Pour les calculs trigonométriques (sin/cos)
- **Unrolling de boucles** : Pour gagner du temps CPU
- **WSYNC** : Attendez la fin de chaque ligne pour la synchronisation

#### Limites du TIA
- **2 sprites par ligne** : Vous ne pouvez afficher que 2 sprites (P0, P1, M0, M1, BL) par ligne
- **Couleurs** : 2 couleurs par sprite (COLUP0, COLUP1)
- **Positionnement** : Utilisez `RESP0`, `RESP1` pour positionner les sprites
- **Motion** : Utilisez `HMP0`, `HMP1` pour le mouvement horizontal

---

## 🎨 **Graphismes**

### Vaisseau (Player 0)
- **Forme** : Triangle (simulé avec des pixels)
- **Couleur** : Blanc ($1A)
- **Taille** : 8 pixels de large (NUSIZ0)

### Tirs (Player 1)
- **Forme** : Petit carré
- **Couleur** : Rouge ($44)
- **Taille** : 4 pixels de large

### Astéroïdes (Playfield)
- **Forme** : Polygones irréguliers (simulés avec le playfield)
- **Couleur** : Gris/Blanc
- **Taille** : Variable (4 tailles différentes)

---

## 🔊 **Son**

L'Atari 2600 a **2 canaux audio** (AUDV0/AUDF0/AUDC0 et AUDV1/AUDF1/AUDC1) :

| Son | Canal | Type | Fréquence |
|-----|-------|------|-----------|
| Propulsion | 0 | Bruit (Noise) | Basse |
| Tir | 1 | Onde carrée | Haute |
| Explosion | 0 | Bruit | Moyenne |

---

## 🐞 **Problèmes connus**

1. **Graphismes simplifiés** : Les astéroïdes sont affichés comme des motifs de playfield simples
   - **Solution** : Implémenter un système de sprites plus avancé avec des kernels personnalisés

2. **Collisions basiques** : Détection par distance (pas de collision pixel-parfect)
   - **Solution** : Utiliser les registres de collision du TIA (CXM0P, CXP0FB, etc.)

3. **Hyperspace non implémenté** : La fonctionnalité n'est pas encore codée
   - **Solution** : Ajouter la logique de téléportation aléatoire

4. **Affichage du score** : Le score n'est pas encore affiché à l'écran
   - **Solution** : Utiliser le playfield pour afficher les chiffres

---

## 📚 **Ressources utiles**

### Documentation Atari 2600
- [Atari 2600 Programming for Newbies](https://www.randomterrain.com/atari-2600-memories-tutorial-andrew-davie-aka-a-davie.html)
- [Stella Programmer's Guide](https://www.atari2600.org/stella/programming/2600_101.txt)
- [TIA Chip Documentation](https://www.atari2600.org/temp/2600%20Hardware%20Info%20-%20TIA%20Chip.txt)

### Outils
- **DASM** : [https://dasm-assembler.github.io/](https://dasm-assembler.github.io/)
- **Stella** : [https://stella-emulator.github.io/](https://stella-emulator.github.io/)
- **6502.org** : [http://www.6502.org/](http://www.6502.org/)
- **AtariAge** : [https://atariage.com/](https://atariage.com/)

### Exemples de code
- **Atari 2600 Demos** : [https://github.com/6502b/atari-2600-demos](https://github.com/6502b/atari-2600-demos)
- **Bankswitching Examples** : [https://github.com/6502b/atari-2600-bankswitching](https://github.com/6502b/atari-2600-bankswitching)

---

## 🎓 **Améliorations possibles**

### Graphismes
1. **Kernel personnalisé** : Pour afficher plus de sprites par ligne
2. **Astéroïdes détaillés** : Utiliser des sprites pour les astéroïdes
3. **Effets de particules** : Pour les explosions
4. **Affichage du score** : Utiliser le playfield pour afficher le score

### Gameplay
1. **Hyperspace** : Implémenter la téléportation aléatoire
2. **Sauvegarde du high score** : Utiliser la RAM de la cartouche (si disponible)
3. **Niveaux plus variés** : Ajouter différents types d'astéroïdes
4. **Bonus** : Ajouter des objets bonus (UFO, etc.)

### Son
1. **Effets sonores améliorés** : Utiliser les 2 canaux pour des sons plus riches
2. **Musique de fond** : Ajouter une musique simple

### Optimisations
1. **Bankswitching** : Pour dépasser la limite de 4 Ko
2. **Compression de données** : Pour les graphismes
3. **Routines plus rapides** : Optimiser le code critique

---

## 📜 **Licence**

Ce projet est sous licence **MIT**. Vous êtes libre de l'utiliser, le modifier et le distribuer.

---

## 🙏 **Remerciements**

- **Atari, Inc.** : Pour avoir créé l'Atari 2600 et le jeu Asteroids original
- **Stella Team** : Pour l'émulateur Stella
- **6502.org Community** : Pour les ressources et la documentation
- **AtariAge Community** : Pour le support et les exemples

---

**Bon codage !** 🚀

*"The Atari 2600 is not a computer. It's a state machine that happens to be programmable."*
