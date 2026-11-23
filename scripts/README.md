# Checks du dépôt

Ce dépôt n'avait ni `package.json`, ni suite de tests, ni workflow CI.
Les checks ci-dessous remplacent les corrections manuelles répétées
(README profil écrasé, artefacts vides, commentaires « for now »,
fichiers de config inventés).

## Lancer les checks

À la racine du dépôt :

```bash
python3 scripts/check.py
```

Code de sortie : `0` si tout passe, `1` sinon. Chaque échec explique
comment corriger la cause, pas le symptôme.

## Lancer le jeu web

Aucun bundler. Depuis `asteroids_vcs2600/` :

```bash
python3 -m http.server 8765
```

Puis ouvrir `http://127.0.0.1:8765/` dans un navigateur.

## Assembler la ROM Atari 2600

Il faut [DASM](https://dasm-assembler.github.io/). Ne pas commiter un
`asteroids.bin` vide. Depuis `asteroids_2600_asm/` :

```bash
./build.sh
# ou : make
```

## Tests unitaires

`python3 scripts/check.py` lance aussi `node tests/test_points.js`, qui
vérifie que le score d'un astéroïde reste un nombre fini.
