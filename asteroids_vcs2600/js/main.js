// ============================================
// MAIN.JS - Point d'entrée du jeu Asteroids
// Style Atari 2600
// ============================================

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le gestionnaire audio
    window.audioManager = new AudioManager();
    
    // Obtenir le canvas
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Créer le jeu
    const game = new AsteroidsGame(canvas, window.audioManager);
    
    // Variables pour la boucle de jeu
    let lastTime = 0;
    let frameCount = 0;
    let fps = 0;
    let lastFpsUpdate = 0;
    
    // Boucle de jeu principale
    function gameLoop(currentTime) {
        // Calculer le delta time
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Mettre à jour le jeu
        game.update();
        
        // Dessiner le jeu
        game.draw();
        
        // Calculer les FPS (pour le débogage)
        frameCount++;
        if (currentTime - lastFpsUpdate >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastFpsUpdate = currentTime;
        }
        
        // Continuer la boucle
        requestAnimationFrame(gameLoop);
    }
    
    // Démarrer la boucle de jeu
    requestAnimationFrame(gameLoop);
    
    // Gérer le redimensionnement du canvas
    function resizeCanvas() {
        // Garder les dimensions fixes pour l'esthétique Atari
        // Mais on peut adapter si nécessaire
        canvas.width = 800;
        canvas.height = 600;
    }
    
    window.addEventListener('resize', resizeCanvas);
    
    // Initialiser la taille du canvas
    resizeCanvas();
    
    // Exposer le jeu pour le débogage
    window.asteroidsGame = game;
    
    // Message de bienvenue dans la console
    console.log('%c ASTEROIDS - Style Atari 2600 ', 'background: #000; color: #0ff; font-size: 20px; font-weight: bold;');
    console.log('%c Contrôles: ', 'color: #fff;');
    console.log('%c ← → : Rotation ', 'color: #0ff;');
    console.log('%c ↑ : Propulsion ', 'color: #0ff;');
    console.log('%c ESPACE : Tirer ', 'color: #0ff;');
    console.log('%c H : Hyperspace ', 'color: #0ff;');
    console.log('%c ÉCHAP : Pause ', 'color: #0ff;');
    console.log('%c M : Couper le son ', 'color: #0ff;');
});
