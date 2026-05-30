// ============================================
// ENTITIES.JS - Classes des entités du jeu Asteroids
// Style Atari 2600
// ============================================

class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0; // en degrés
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
        this.size = AsteroidsUtils.GAME_CONSTANTS.SHIP_SIZE;
        this.color = AsteroidsUtils.GAME_CONSTANTS.COLORS.WHITE;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.blinkTimer = 0;
        this.isVisible = true;
        this.thrusting = false;
        this.thrustSound = null;
    }
    
    update(keys, canvasWidth, canvasHeight) {
        // Rotation
        if (keys.ArrowLeft || keys.KeyA) {
            this.angle -= AsteroidsUtils.GAME_CONSTANTS.ROTATION_SPEED;
        }
        if (keys.ArrowRight || keys.KeyD) {
            this.angle += AsteroidsUtils.GAME_CONSTANTS.ROTATION_SPEED;
        }
        this.angle = AsteroidsUtils.normalizeAngle(this.angle);
        
        // Propulsion
        if ((keys.ArrowUp || keys.KeyW) && !this.thrusting) {
            this.thrusting = true;
            if (window.audioManager) {
                this.thrustSound = window.audioManager.playThrust();
            }
        } else if (!(keys.ArrowUp || keys.KeyW) && this.thrusting) {
            this.thrusting = false;
            if (this.thrustSound) {
                this.thrustSound.stop();
                this.thrustSound = null;
            }
        }
        
        if (this.thrusting) {
            const direction = AsteroidsUtils.getDirectionVector(this.angle);
            this.velocity.x += direction.x * AsteroidsUtils.GAME_CONSTANTS.ACCELERATION;
            this.velocity.y += direction.y * AsteroidsUtils.GAME_CONSTANTS.ACCELERATION;
            
            // Limiter la vitesse
            const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > AsteroidsUtils.GAME_CONSTANTS.MAX_SPEED) {
                this.velocity.x = (this.velocity.x / speed) * AsteroidsUtils.GAME_CONSTANTS.MAX_SPEED;
                this.velocity.y = (this.velocity.y / speed) * AsteroidsUtils.GAME_CONSTANTS.MAX_SPEED;
            }
        }
        
        // Application de la friction (espace vide = pas de friction dans l'original Atari)
        // Mais on garde un peu pour le gameplay moderne
        this.velocity.x *= AsteroidsUtils.GAME_CONSTANTS.FRICTION;
        this.velocity.y *= AsteroidsUtils.GAME_CONSTANTS.FRICTION;
        
        // Déplacement
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Wrap-around (sortie d'un côté, entrée de l'autre)
        this.x = AsteroidsUtils.wrapAround(this.x, -this.size, canvasWidth + this.size);
        this.y = AsteroidsUtils.wrapAround(this.y, -this.size, canvasHeight + this.size);
        
        // Gestion de l'invulnérabilité
        if (this.invulnerable) {
            this.invulnerabilityTimer--;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
            }
            
            // Clignotement
            this.blinkTimer++;
            if (this.blinkTimer >= 10) {
                this.isVisible = !this.isVisible;
                this.blinkTimer = 0;
            }
        } else {
            this.isVisible = true;
        }
    }
    
    draw(ctx) {
        if (!this.isVisible) return;
        
        // Dessiner le vaisseau
        AsteroidsUtils.drawTriangle(ctx, this.x, this.y, this.size, this.angle, this.color);
        
        // Dessiner la flamme de propulsion si en cours
        if (this.thrusting) {
            const direction = AsteroidsUtils.getDirectionVector(this.angle + 180);
            const flameLength = this.size * 0.8;
            const flameWidth = this.size * 0.4;
            
            const flamePoints = [
                { x: this.x + direction.x * flameLength, y: this.y + direction.y * flameLength },
                { x: this.x + direction.x * flameLength * 0.7 + direction.y * flameWidth * 0.5, 
                  y: this.y + direction.y * flameLength * 0.7 - direction.x * flameWidth * 0.5 },
                { x: this.x + direction.x * flameLength * 0.7 - direction.y * flameWidth * 0.5, 
                  y: this.y + direction.y * flameLength * 0.7 + direction.x * flameWidth * 0.5 }
            ];
            
            ctx.save();
            ctx.fillStyle = AsteroidsUtils.GAME_CONSTANTS.COLORS.RED;
            ctx.beginPath();
            ctx.moveTo(Math.round(flamePoints[0].x), Math.round(flamePoints[0].y));
            ctx.lineTo(Math.round(flamePoints[1].x), Math.round(flamePoints[1].y));
            ctx.lineTo(Math.round(flamePoints[2].x), Math.round(flamePoints[2].y));
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
    
    shoot() {
        const direction = AsteroidsUtils.getDirectionVector(this.angle);
        const bulletX = this.x + direction.x * this.size;
        const bulletY = this.y + direction.y * this.size;
        return new Bullet(bulletX, bulletY, this.velocity.x, this.velocity.y, this.angle);
    }
    
    hyperspace(canvasWidth, canvasHeight) {
        this.x = AsteroidsUtils.randomRange(this.size, canvasWidth - this.size);
        this.y = AsteroidsUtils.randomRange(this.size, canvasHeight - this.size);
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.invulnerable = true;
        this.invulnerabilityTimer = AsteroidsUtils.GAME_CONSTANTS.HYPERSPACE_DELAY;
        this.blinkTimer = 0;
        
        if (window.audioManager) {
            window.audioManager.playHyperspace();
        }
    }
    
    getCollisionRadius() {
        return this.size * 0.8;
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        this.invulnerable = true;
        this.invulnerabilityTimer = AsteroidsUtils.GAME_CONSTANTS.SHIP_INVULNERABILITY;
        this.blinkTimer = 0;
        this.isVisible = true;
        this.thrusting = false;
    }
}

class Bullet {
    constructor(x, y, parentVx, parentVy, angle) {
        this.x = x;
        this.y = y;
        this.velocity = AsteroidsUtils.getDirectionVector(angle);
        this.velocity.x *= AsteroidsUtils.GAME_CONSTANTS.BULLET_SPEED + parentVx * 0.5;
        this.velocity.y *= AsteroidsUtils.GAME_CONSTANTS.BULLET_SPEED + parentVy * 0.5;
        this.size = AsteroidsUtils.GAME_CONSTANTS.BULLET_SIZE;
        this.color = AsteroidsUtils.GAME_CONSTANTS.COLORS.YELLOW;
        this.lifetime = AsteroidsUtils.GAME_CONSTANTS.BULLET_LIFETIME;
        this.active = true;
    }
    
    update(canvasWidth, canvasHeight) {
        this.lifetime--;
        if (this.lifetime <= 0) {
            this.active = false;
            return;
        }
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Wrap-around
        this.x = AsteroidsUtils.wrapAround(this.x, -this.size, canvasWidth + this.size);
        this.y = AsteroidsUtils.wrapAround(this.y, -this.size, canvasHeight + this.size);
    }
    
    draw(ctx) {
        if (!this.active) return;
        
        // Dessiner le tir comme un petit rectangle (style Atari)
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.fillRect(
            Math.round(this.x - this.size/2),
            Math.round(this.y - this.size/2),
            this.size,
            this.size
        );
        ctx.restore();
    }
    
    getCollisionRadius() {
        return this.size / 2;
    }
}

class Asteroid {
    constructor(x, y, size, velocityX, velocityY, rotationSpeed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.velocity = { x: velocityX, y: velocityY };
        this.rotation = 0;
        this.rotationSpeed = rotationSpeed || AsteroidsUtils.randomRange(-2, 2);
        this.color = this.getColorBySize();
        this.detail = this.getDetailBySize();
        this.splitCount = 0;
        this.maxSplitCount = this.getMaxSplits();
    }
    
    getColorBySize() {
        if (this.size > 60) return AsteroidsUtils.GAME_CONSTANTS.COLORS.WHITE;
        if (this.size > 40) return AsteroidsUtils.GAME_CONSTANTS.COLORS.CYAN;
        if (this.size > 20) return AsteroidsUtils.GAME_CONSTANTS.COLORS.MAGENTA;
        return AsteroidsUtils.GAME_CONSTANTS.COLORS.YELLOW;
    }
    
    getDetailBySize() {
        if (this.size > 60) return 12;
        if (this.size > 40) return 10;
        if (this.size > 20) return 8;
        return 6;
    }
    
    getMaxSplits() {
        if (this.size > 60) return 3;
        if (this.size > 40) return 2;
        return 1;
    }
    
    update(canvasWidth, canvasHeight) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.rotation += this.rotationSpeed;
        
        // Wrap-around
        this.x = AsteroidsUtils.wrapAround(this.x, -this.size * 2, canvasWidth + this.size * 2);
        this.y = AsteroidsUtils.wrapAround(this.y, -this.size * 2, canvasHeight + this.size * 2);
    }
    
    draw(ctx) {
        AsteroidsUtils.drawAsteroid(
            ctx, 
            this.x, 
            this.y, 
            this.size / 2, 
            this.rotation,
            this.color,
            this.detail
        );
    }
    
    getCollisionRadius() {
        return this.size / 2;
    }
    
    split() {
        if (this.splitCount >= this.maxSplitCount) {
            return [];
        }
        
        this.splitCount++;
        const newSize = this.size / 2;
        const newAsteroids = [];
        
        for (let i = 0; i < AsteroidsUtils.GAME_CONSTANTS.ASTEROID_SPLIT_COUNT; i++) {
            const angle = AsteroidsUtils.randomRange(0, 360);
            const direction = AsteroidsUtils.getDirectionVector(angle);
            const speed = AsteroidsUtils.randomRange(
                AsteroidsUtils.GAME_CONSTANTS.ASTEROID_MIN_SPEED,
                AsteroidsUtils.GAME_CONSTANTS.ASTEROID_MAX_SPEED
            );
            
            newAsteroids.push(new Asteroid(
                this.x,
                this.y,
                newSize,
                direction.x * speed + this.velocity.x * 0.5,
                direction.y * speed + this.velocity.y * 0.5,
                AsteroidsUtils.randomRange(-3, 3)
            ));
        }
        
        return newAsteroids;
    }
    
    static createRandom(canvasWidth, canvasHeight, avoidX, avoidY, avoidRadius) {
        let x, y, distance;
        const minDistance = 150;
        
        do {
            x = AsteroidsUtils.randomRange(0, canvasWidth);
            y = AsteroidsUtils.randomRange(0, canvasHeight);
            distance = AsteroidsUtils.distance(x, y, avoidX, avoidY);
        } while (distance < minDistance + avoidRadius);
        
        const size = AsteroidsUtils.randomRange(
            AsteroidsUtils.GAME_CONSTANTS.ASTEROID_MIN_SIZE,
            AsteroidsUtils.GAME_CONSTANTS.ASTEROID_MAX_SIZE
        );
        
        const angle = AsteroidsUtils.randomRange(0, 360);
        const direction = AsteroidsUtils.getDirectionVector(angle);
        const speed = AsteroidsUtils.randomRange(
            AsteroidsUtils.GAME_CONSTANTS.ASTEROID_MIN_SPEED,
            AsteroidsUtils.GAME_CONSTANTS.ASTEROID_MAX_SPEED
        );
        
        return new Asteroid(
            x,
            y,
            size,
            direction.x * speed,
            direction.y * speed,
            AsteroidsUtils.randomRange(-2, 2)
        );
    }
}

class Particle {
    constructor(x, y, velocityX, velocityY, size, color, lifetime) {
        this.x = x;
        this.y = y;
        this.velocity = { x: velocityX, y: velocityY };
        this.size = size;
        this.color = color;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
    }
    
    update() {
        this.lifetime--;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Fading
        this.size *= 0.95;
    }
    
    draw(ctx) {
        if (this.lifetime <= 0) return;
        
        const alpha = this.lifetime / this.maxLifetime;
        ctx.save();
        ctx.globalAlpha = alpha;
        AsteroidsUtils.drawParticle(ctx, this.x, this.y, this.size, this.color);
        ctx.restore();
    }
    
    isDead() {
        return this.lifetime <= 0 || this.size <= 0.5;
    }
}

class Explosion {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.lifetime = 60;
        
        // Créer des particules
        for (let i = 0; i < 20; i++) {
            const angle = AsteroidsUtils.randomRange(0, 360);
            const direction = AsteroidsUtils.getDirectionVector(angle);
            const speed = AsteroidsUtils.randomRange(1, 5);
            const particleSize = AsteroidsUtils.randomRange(2, 6);
            const particleLifetime = AsteroidsUtils.randomRange(20, 60);
            
            const color = [
                AsteroidsUtils.GAME_CONSTANTS.COLORS.WHITE,
                AsteroidsUtils.GAME_CONSTANTS.COLORS.YELLOW,
                AsteroidsUtils.GAME_CONSTANTS.COLORS.RED,
                AsteroidsUtils.GAME_CONSTANTS.COLORS.ORANGE
            ][Math.floor(Math.random() * 4)];
            
            this.particles.push(new Particle(
                x,
                y,
                direction.x * speed,
                direction.y * speed,
                particleSize,
                color,
                particleLifetime
            ));
        }
    }
    
    update() {
        this.lifetime--;
        
        // Mettre à jour les particules
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }
    
    isDead() {
        return this.lifetime <= 0 && this.particles.length === 0;
    }
}

// Exporter les classes
window.Ship = Ship;
window.Bullet = Bullet;
window.Asteroid = Asteroid;
window.Particle = Particle;
window.Explosion = Explosion;
