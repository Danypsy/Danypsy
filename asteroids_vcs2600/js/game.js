// ============================================
// GAME.JS - Logique principale du jeu Asteroids
// Style Atari 2600
// ============================================

class Game {
    constructor(canvas, audioManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioManager = audioManager;
        
        // État du jeu
        this.state = 'title'; // 'title', 'playing', 'game_over', 'paused', 'level_complete'
        
        // Entités
        this.ship = null;
        this.bullets = [];
        this.asteroids = [];
        this.explosions = [];
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.highScore = localStorage.getItem('asteroids_highscore') || 0;
        
        // Timers
        this.spawnTimer = 0;
        this.levelTimer = 0;
        this.hyperspaceCooldown = 0;
        this.invulnerabilityTimer = 0;
        
        // Contrôles
        this.keys = {};
        this.lastKeyState = {};
        
        // Initialisation
        this.init();
    }
    
    init() {
        // Créer le vaisseau
        this.ship = new Ship(
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        
        // Réinitialiser les timers
        this.spawnTimer = 0;
        this.levelTimer = 0;
        this.hyperspaceCooldown = 0;
        
        // Écouteurs d'événements
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Clavier
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Gérer les actions instantanées
            if (e.code === 'Space' && this.lastKeyState[e.code] !== true) {
                this.handleShoot();
            }
            
            if (e.code === 'KeyH' && this.lastKeyState[e.code] !== true) {
                this.handleHyperspace();
            }
            
            if (e.code === 'Escape') {
                this.togglePause();
            }
            
            if (e.code === 'KeyM') {
                this.audioManager.toggleMute();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Boutons
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.togglePause();
        });
    }
    
    startGame() {
        this.state = 'playing';
        
        // Masquer les écrans
        document.getElementById('title-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        
        // Réinitialiser le vaisseau
        this.ship.reset(
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        
        // Commencer le niveau
        this.startLevel();
    }
    
    startLevel() {
        this.levelTimer = AsteroidsUtils.GAME_CONSTANTS.LEVEL_SPAWN_DELAY;
        this.spawnTimer = 0;
        
        // Nettoyer les astéroïdes existants
        this.asteroids = [];
        this.bullets = [];
        this.explosions = [];
        
        // Spawner les astéroïdes du niveau
        const asteroidCount = AsteroidsUtils.GAME_CONSTANTS.ASTEROIDS_PER_LEVEL + Math.floor(this.level / 2);
        
        for (let i = 0; i < asteroidCount; i++) {
            this.spawnAsteroid();
        }
    }
    
    spawnAsteroid() {
        const asteroid = Asteroid.createRandom(
            this.canvas.width,
            this.canvas.height,
            this.ship.x,
            this.ship.y,
            this.ship.getCollisionRadius()
        );
        this.asteroids.push(asteroid);
    }
    
    handleShoot() {
        if (this.state !== 'playing') return;
        if (!this.ship || this.ship.invulnerable) return;
        
        // Limiter le nombre de tirs (cooldown)
        const now = Date.now();
        if (this.lastShootTime && now - this.lastShootTime < 200) return;
        this.lastShootTime = now;
        
        // Créer un tir
        const bullet = this.ship.shoot();
        this.bullets.push(bullet);
        
        // Jouer le son
        if (this.audioManager) {
            this.audioManager.playShoot();
        }
    }
    
    handleHyperspace() {
        if (this.state !== 'playing') return;
        if (this.hyperspaceCooldown > 0) return;
        if (!this.ship) return;
        
        this.ship.hyperspace(this.canvas.width, this.canvas.height);
        this.hyperspaceCooldown = AsteroidsUtils.GAME_CONSTANTS.HYPERSPACE_COOLDOWN;
    }
    
    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pause-screen').classList.remove('hidden');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pause-screen').classList.add('hidden');
        }
    }
    
    update() {
        if (this.state !== 'playing') return;
        
        // Mettre à jour les timers
        this.spawnTimer--;
        this.levelTimer--;
        this.hyperspaceCooldown--;
        
        // Mettre à jour le vaisseau
        if (this.ship) {
            this.ship.update(this.keys, this.canvas.width, this.canvas.height);
        }
        
        // Mettre à jour les tirs
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(this.canvas.width, this.canvas.height);
            if (!this.bullets[i].active) {
                this.bullets.splice(i, 1);
            }
        }
        
        // Mettre à jour les astéroïdes
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            this.asteroids[i].update(this.canvas.width, this.canvas.height);
        }
        
        // Mettre à jour les explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update();
            if (this.explosions[i].isDead()) {
                this.explosions.splice(i, 1);
            }
        }
        
        // Spawner de nouveaux astéroïdes
        if (this.spawnTimer <= 0 && this.asteroids.length < 10) {
            this.spawnAsteroid();
            this.spawnTimer = AsteroidsUtils.GAME_CONSTANTS.ASTEROID_SPAWN_DELAY * (1 - Math.min(0.5, (this.level - 1) * 0.05));
        }
        
        // Vérifier les collisions
        this.checkCollisions();
        
        // Vérifier si tous les astéroïdes sont détruits
        if (this.asteroids.length === 0 && this.levelTimer <= 0) {
            this.levelComplete();
        }
        
        // Mettre à jour l'interface
        this.updateHUD();
    }
    
    checkCollisions() {
        if (!this.ship) return;
        
        // Collisions entre tirs et astéroïdes
        for (let b = this.bullets.length - 1; b >= 0; b--) {
            const bullet = this.bullets[b];
            if (!bullet.active) continue;
            
            for (let a = this.asteroids.length - 1; a >= 0; a--) {
                const asteroid = this.asteroids[a];
                
                if (AsteroidsUtils.checkCircleCollision(
                    bullet.x, bullet.y, bullet.getCollisionRadius(),
                    asteroid.x, asteroid.y, asteroid.getCollisionRadius()
                )) {
                    // Détruire l'astéroïde
                    this.destroyAsteroid(a);
                    
                    // Détruire le tir
                    bullet.active = false;
                    this.bullets.splice(b, 1);
                    
                    break;
                }
            }
        }
        
        // Collisions entre vaisseau et astéroïdes
        if (!this.ship.invulnerable) {
            for (let a = this.asteroids.length - 1; a >= 0; a--) {
                const asteroid = this.asteroids[a];
                
                if (AsteroidsUtils.checkCircleCollision(
                    this.ship.x, this.ship.y, this.ship.getCollisionRadius(),
                    asteroid.x, asteroid.y, asteroid.getCollisionRadius()
                )) {
                    // Détruire le vaisseau
                    this.shipHit();
                    
                    // Détruire l'astéroïde
                    this.destroyAsteroid(a);
                    
                    break;
                }
            }
        }
    }
    
    destroyAsteroid(index) {
        const asteroid = this.asteroids[index];
        
        // Ajouter des points en fonction de la taille
        const points = Math.floor(100 / asteroid.splitCount);
        this.score += points;
        
        // Créer une explosion
        this.explosions.push(new Explosion(asteroid.x, asteroid.y, asteroid.size));
        
        // Jouer le son
        if (this.audioManager) {
            this.audioManager.playExplosion();
        }
        
        // Diviser l'astéroïde
        const newAsteroids = asteroid.split();
        this.asteroids.splice(index, 1);
        
        for (const newAsteroid of newAsteroids) {
            this.asteroids.push(newAsteroid);
        }
        
        // Vérifier le high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('asteroids_highscore', this.highScore);
        }
    }
    
    shipHit() {
        this.lives--;
        
        // Créer une explosion
        this.explosions.push(new Explosion(this.ship.x, this.ship.y, this.ship.size * 2));
        
        // Jouer le son
        if (this.audioManager) {
            this.audioManager.playLargeExplosion();
        }
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Réinitialiser le vaisseau
            this.ship.reset(
                this.canvas.width / 2,
                this.canvas.height / 2
            );
        }
    }
    
    levelComplete() {
        this.level++;
        this.levelTimer = AsteroidsUtils.GAME_CONSTANTS.LEVEL_SPAWN_DELAY;
        
        // Bonus de niveau
        this.score += 1000 * this.level;
        
        // Vérifier le high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('asteroids_highscore', this.highScore);
        }
        
        // Commencer le nouveau niveau
        this.startLevel();
    }
    
    gameOver() {
        this.state = 'game_over';
        
        // Afficher l'écran de game over
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('final-score').textContent = `SCORE: ${this.score}`;
        
        // Vérifier le high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('asteroids_highscore', this.highScore);
        }
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.asteroids = [];
        this.bullets = [];
        this.explosions = [];
        
        // Réinitialiser le vaisseau
        this.ship.reset(
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        
        // Réinitialiser les timers
        this.spawnTimer = 0;
        this.levelTimer = 0;
        this.hyperspaceCooldown = 0;
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    draw() {
        // Effacer le canvas
        this.ctx.fillStyle = AsteroidsUtils.GAME_CONSTANTS.COLORS.BLACK;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner les étoiles de fond (style Atari 2600)
        this.drawStarfield();
        
        // Dessiner les entités
        if (this.ship) {
            this.ship.draw(this.ctx);
        }
        
        for (const bullet of this.bullets) {
            bullet.draw(this.ctx);
        }
        
        for (const asteroid of this.asteroids) {
            asteroid.draw(this.ctx);
        }
        
        for (const explosion of this.explosions) {
            explosion.draw(this.ctx);
        }
        
        // Dessiner l'interface
        this.drawHUD();
    }
    
    drawStarfield() {
        // Dessiner des étoiles aléatoires pour simuler l'espace
        this.ctx.save();
        this.ctx.fillStyle = AsteroidsUtils.GAME_CONSTANTS.COLORS.WHITE;
        
        // Étoiles fixes
        for (let i = 0; i < 50; i++) {
            const x = (i * 17) % this.canvas.width;
            const y = (i * 23) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
        
        // Étoiles clignotantes
        if (Math.random() < 0.1) {
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                this.ctx.fillRect(x, y, 1, 1);
            }
        }
        
        this.ctx.restore();
    }
    
    drawHUD() {
        // Ne pas dessiner si l'écran de titre ou game over est affiché
        if (this.state === 'title' || this.state === 'game_over' || this.state === 'paused') {
            return;
        }
        
        // Le HUD est géré par le HTML
    }
    
    getState() {
        return this.state;
    }
}

// Exporter la classe
window.AsteroidsGame = Game;
