// ============================================
// UTILS.JS - Fonctions utilitaires pour Asteroids
// Style Atari 2600
// ============================================

// Constantes du jeu
const GAME_CONSTANTS = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Physique
    MAX_SPEED: 4,
    ACCELERATION: 0.15,
    FRICTION: 0.98,
    ROTATION_SPEED: 5,
    
    // Vaisseau
    SHIP_SIZE: 20,
    SHIP_INVULNERABILITY: 120, // frames
    
    // Tirs
    BULLET_SPEED: 8,
    BULLET_LIFETIME: 60, // frames
    BULLET_SIZE: 4,
    
    // Astéroïdes
    ASTEROID_SPAWN_DELAY: 60, // frames entre chaque astéroïde
    ASTEROID_MIN_SIZE: 30,
    ASTEROID_MAX_SIZE: 80,
    ASTEROID_MIN_SPEED: 0.5,
    ASTEROID_MAX_SPEED: 2.5,
    ASTEROID_SPLIT_COUNT: 2,
    
    // Niveaux
    ASTEROIDS_PER_LEVEL: 4,
    LEVEL_SPAWN_DELAY: 120, // frames entre les vagues
    
    // Hyperspace
    HYPERSPACE_DELAY: 60, // frames d'invulnérabilité
    HYPERSPACE_COOLDOWN: 180, // frames entre chaque utilisation
    
    // Couleurs Atari 2600
    COLORS: {
        BLACK: '#000000',
        WHITE: '#ffffff',
        CYAN: '#00ffff',
        MAGENTA: '#ff00ff',
        YELLOW: '#ffff00',
        GREEN: '#00ff00',
        RED: '#ff0000',
        BLUE: '#0000ff',
        ORANGE: '#ff8800'
    }
};

// Fonction pour générer un nombre aléatoire entre min et max
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Fonction pour générer un entier aléatoire entre min et max
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction pour calculer la distance entre deux points
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Fonction pour vérifier la collision entre deux cercles
function checkCircleCollision(x1, y1, r1, x2, y2, r2) {
    return distance(x1, y1, x2, y2) < (r1 + r2);
}

// Fonction pour vérifier si un point est dans un cercle
function pointInCircle(px, py, cx, cy, r) {
    return distance(px, py, cx, cy) < r;
}

// Fonction pour normaliser un angle en degrés (0-360)
function normalizeAngle(angle) {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
}

// Convertir degrés en radians
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// Convertir radians en degrés
function radToDeg(radians) {
    return radians * 180 / Math.PI;
}

// Fonction pour obtenir un vecteur de direction à partir d'un angle
function getDirectionVector(angle) {
    const rad = degToRad(angle);
    return { x: Math.cos(rad), y: Math.sin(rad) };
}

// Fonction pour dessiner une ligne avec l'effet "Atari 2600" (pixelisé)
function drawAtariLine(ctx, x1, y1, x2, y2, color, lineWidth = 2) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(Math.round(x1), Math.round(y1));
    ctx.lineTo(Math.round(x2), Math.round(y2));
    ctx.stroke();
    ctx.restore();
}

// Fonction pour dessiner un triangle (vaisseau)
function drawTriangle(ctx, x, y, size, angle, color) {
    const rad = degToRad(angle);
    const points = [
        { x: x + Math.cos(rad) * size, y: y + Math.sin(rad) * size },
        { x: x + Math.cos(rad + degToRad(120)) * size * 0.6, 
          y: y + Math.sin(rad + degToRad(120)) * size * 0.6 },
        { x: x + Math.cos(rad + degToRad(240)) * size * 0.6, 
          y: y + Math.sin(rad + degToRad(240)) * size * 0.6 }
    ];
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(Math.round(points[0].x), Math.round(points[0].y));
    ctx.lineTo(Math.round(points[1].x), Math.round(points[1].y));
    ctx.lineTo(Math.round(points[2].x), Math.round(points[2].y));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Fonction pour dessiner un astéroïde (polygone irrégulier)
function drawAsteroid(ctx, x, y, radius, angle, color, detail = 8) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(degToRad(angle));
    
    ctx.beginPath();
    for (let i = 0; i <= detail; i++) {
        const a = (i / detail) * Math.PI * 2;
        const r = radius * (0.7 + Math.random() * 0.6); // Variation aléatoire
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        
        if (i === 0) {
            ctx.moveTo(Math.round(px), Math.round(py));
        } else {
            ctx.lineTo(Math.round(px), Math.round(py));
        }
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    
    // Contour
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
}

// Fonction pour dessiner un cercle pixelisé
function drawPixelCircle(ctx, x, y, radius, color) {
    ctx.save();
    ctx.fillStyle = color;
    
    const centerX = Math.round(x);
    const centerY = Math.round(y);
    const r = Math.round(radius);
    
    for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
                ctx.fillRect(centerX + dx, centerY + dy, 1, 1);
            }
        }
    }
    
    ctx.restore();
}

// Fonction pour dessiner du texte avec effet Atari
function drawAtariText(ctx, text, x, y, color = '#ffffff', size = 20) {
    ctx.save();
    ctx.font = `${size}px 'Courier New', monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, Math.round(x), Math.round(y));
    ctx.restore();
}

// Fonction pour dessiner des particules (effets d'explosion)
function drawParticle(ctx, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x - size/2), Math.round(y - size/2), size, size);
    ctx.restore();
}

// Fonction pour gérer le wrap-around (sortie d'un côté, entrée de l'autre)
function wrapAround(value, min, max) {
    if (value < min) return max;
    if (value > max) return min;
    return value;
}

// Fonction pour limiter une valeur entre min et max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Export des fonctions pour les autres modules
window.AsteroidsUtils = {
    GAME_CONSTANTS,
    randomRange,
    randomInt,
    distance,
    checkCircleCollision,
    pointInCircle,
    normalizeAngle,
    degToRad,
    radToDeg,
    getDirectionVector,
    drawAtariLine,
    drawTriangle,
    drawAsteroid,
    drawPixelCircle,
    drawAtariText,
    drawParticle,
    wrapAround,
    clamp
};
