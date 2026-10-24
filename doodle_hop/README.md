# Doodle Hop

Jeu de saut vertical dans le navigateur, inspiré des platformers où l'on grimpe sans jamais s'arrêter. Le personnage rebondit tout seul. À toi de le décaler à gauche et à droite pour enchaîner les plateformes.

Tout est dessiné sur un cahier, en HTML5, sans images ni bibliothèques.

## Jouer

Ouvre `index.html` dans un navigateur, ou sers le dossier :

```bash
python3 -m http.server 8765
```

Puis va sur `http://localhost:8765/doodle_hop/`.

## Contrôles

| Action | Clavier | Tactile |
| --- | --- | --- |
| Se déplacer | Flèches, A/Q et D | Maintenir à gauche ou à droite de l'écran |
| Tirer | Espace, flèche haut, Z/W | Bouton Tirer |
| Pause | Échap | Bouton II |
| Son | M | Bouton Son |
| Lancer / recommencer | Entrée | Boutons Jouer et Recommencer |

Sortir par un bord de l'écran fait réapparaître le personnage de l'autre côté.

## Plateformes

- **Vertes** : rebond normal
- **Bleues** : elles glissent de gauche à droite
- **Rouges à ressort** : grand bond vers une plateforme plus haute
- **Marron** : elles cassent et ne renvoient pas
- **Blanches** : un seul rebond, puis elles disparaissent
- **Bestioles** : écrase-les par au-dessus ou tire dessus. Un choc de côté fait perdre
- **Jetpack et hélice** : une montée automatique, plus ou moins longue

Le parcours principal reste toujours à portée d'un saut. Les plateformes cassantes, les bestioles et les bonus sont des écarts.

Le score compte la hauteur, plus 250 points par bestiole et 150 par bonus. Le record reste dans le navigateur.

## Fichiers

```
doodle_hop/
├── index.html
├── style.css
├── js/
│   ├── physics.js    # simulation, sans DOM
│   ├── draw.js
│   ├── audio.js
│   ├── game.js
│   └── main.js
└── test/physics.test.js
```

## Tests

```bash
node doodle_hop/test/physics.test.js
```

## Licence

MIT
