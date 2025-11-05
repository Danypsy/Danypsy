# 🎲 Baldur's Gate 2D6

Un jeu de rôle textuel basé sur le système 2D6, situé dans l'univers légendaire de Baldur's Gate.

## 📖 Description

Ce jeu est une adaptation du célèbre RPG Baldur's Gate utilisant un système de jeu simplifié basé sur le lancer de 2 dés à 6 faces (2D6). Vivez une aventure épique en affrontant des créatures dangereuses et découvrez votre héritage divin en tant qu'enfant de Bhaal!

## 🎮 Comment Jouer

### Lancement du jeu

```bash
python3 main.py
```

### Création de personnage

Au début du jeu, vous créerez votre personnage en choisissant:

#### Races disponibles
- **Humain**: Polyvalent (+1 à toutes les actions)
- **Elfe**: Magie (+2 aux actions magiques)
- **Nain**: Résistance (+2 PV supplémentaires)
- **Demi-elfe**: Charisme (+1 aux interactions sociales)
- **Halfelin**: Discrétion (+2 aux actions furtives)

#### Classes disponibles
- **Guerrier**: Maître des armes (10 PV, +2 Combat, -1 Magie)
- **Mage**: Manipulateur des arcanes (6 PV, -1 Combat, +3 Magie)
- **Roublard**: Expert en ruse (8 PV, +1 Combat, 0 Magie)
- **Clerc**: Serviteur des dieux (8 PV, +1 Combat, +2 Magie)
- **Rôdeur**: Traqueur expert (9 PV, +2 Combat, 0 Magie)

## 🎲 Système de Jeu 2D6

### Mécanique de base
Le jeu utilise le système 2D6 (lancer de 2 dés à 6 faces):
- **2-6**: Échec
- **7-9**: Succès partiel
- **10-11**: Succès
- **12**: Succès critique ⭐

### Combat
En combat, vous pouvez:
1. **Attaquer au corps-à-corps**: Utilise votre bonus de combat
2. **Lancer un sort**: Utilise votre bonus de magie (si disponible)
3. **Utiliser une potion**: Récupère des points de vie

### Progression
- Gagnez de l'**expérience (XP)** en battant des ennemis
- Montez de **niveau** pour augmenter vos PV
- Collectez de l'**or** pour vos aventures

## 🗺️ Structure du Jeu

### Chapitre 1: Les Routes Dangereuses
Quittez Château-Suif et affrontez vos premières menaces sur la route de Porte de Baldur.

### Chapitre 2: Les Mines de Nashkel
Explorez les mines infestées de créatures et découvrez le complot qui se trame.

### Chapitre 3: Le Complot de Sarevok
Affrontez les gardes de Sarevok et préparez-vous au combat final.

### Combat Final: Sarevok
Affrontez votre demi-frère Sarevok dans un duel épique pour le destin de la Côte des Épées!

## 👹 Ennemis

Vous affronterez diverses créatures de l'univers de Baldur's Gate:
- **Kobolds** et **Gobelins** (faciles)
- **Loups Géants** et **Squelettes** (moyens)
- **Bandits** et **Araignées Géantes** (moyens)
- **Ogres** et **Ogres Mages** (difficiles)
- **Dragon Noir** (très difficile)
- **Sarevok** (boss final)

## 🛠️ Structure du Code

```
Danypsy/
├── main.py              # Point d'entrée du jeu
├── src/
│   ├── __init__.py      # Package initialization
│   ├── dice.py          # Système de dés 2D6
│   ├── character.py     # Classes et races de personnages
│   ├── enemies.py       # Ennemis et créatures
│   ├── combat.py        # Système de combat
│   └── game.py          # Logique principale du jeu
└── BALDURS_GATE_2D6.md  # Ce fichier
```

## 📚 Modules

### dice.py
Gère le système de dés 2D6 avec:
- Lancers simples et avec modificateurs
- Interprétation des résultats
- Vérification de réussite/échec

### character.py
Définit la classe `Character` avec:
- 5 classes de personnages
- 5 races jouables
- Système de combat et de magie
- Progression et montée de niveau

### enemies.py
Contient tous les ennemis:
- Classe de base `Enemy`
- 10 types de créatures différentes
- Générateur d'ennemis aléatoires

### combat.py
Gère les combats avec:
- Système de tours
- Choix d'actions
- Résolution et récompenses

### game.py
Orchestre le jeu:
- Création de personnage
- Déroulement de l'histoire
- Chapitres et progression

## 🎯 Conseils de Jeu

1. **Choisissez votre classe judicieusement**: Les guerriers sont robustes, les mages puissants mais fragiles
2. **Reposez-vous entre les combats**: La récupération de PV est cruciale
3. **Utilisez vos potions intelligemment**: Elles peuvent sauver votre vie
4. **Montez de niveau**: Chaque niveau augmente vos PV et vos chances de survie
5. **Préparez-vous pour Sarevok**: Le boss final est redoutable!

## 🏆 Objectif

Survivre à tous les chapitres et vaincre Sarevok pour sauver la Côte des Épées et découvrir votre véritable destinée en tant qu'enfant de Bhaal!

## ⚔️ Inspirations

Ce jeu s'inspire de:
- **Baldur's Gate** (BioWare, 1998)
- **Dungeons & Dragons** (système D&D)
- **Powered by the Apocalypse** (système 2D6)

## 📝 Version

Version 1.0.0 - Première version complète

---

**Bonne aventure, héros! Que Tymora guide vos lancers de dés! 🎲**
