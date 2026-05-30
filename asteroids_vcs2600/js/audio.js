// ============================================
// AUDIO.JS - Gestion des sons pour Asteroids
// Style Atari 2600 (sons 8-bit)
// ============================================

class AudioManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.volume = 0.5;
        
        // Initialiser les sons
        this.initSounds();
    }
    
    initSounds() {
        // Créer des sons 8-bit avec l'API Web Audio
        // Cela permet de générer des sons sans fichiers audio
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.oscillators = {};
        this.gainNodes = {};
        
        // Créer les sons
        this.createThrustSound();
        this.createShootSound();
        this.createExplosionSound();
        this.createLargeExplosionSound();
        this.createHyperspaceSound();
    }
    
    createThrustSound() {
        // Son de propulsion (bruit blanc filtré)
        const bufferSize = this.audioContext.sampleRate * 0.2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        this.thrustBuffer = buffer;
    }
    
    createShootSound() {
        // Son de tir (onde carrée)
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        const frequency = 800;
        const period = this.audioContext.sampleRate / frequency;
        
        for (let i = 0; i < bufferSize; i++) {
            const phase = (i / period) % 1;
            data[i] = phase < 0.5 ? 0.5 : -0.5;
            // Enveloppe
            data[i] *= Math.min(1, (bufferSize - i) / (bufferSize * 0.1));
        }
        
        this.shootBuffer = buffer;
    }
    
    createExplosionSound() {
        // Son d'explosion (bruit avec enveloppe)
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const noise = Math.random() * 2 - 1;
            const envelope = Math.exp(-i / (bufferSize * 0.1));
            data[i] = noise * envelope;
        }
        
        this.explosionBuffer = buffer;
    }
    
    createLargeExplosionSound() {
        // Son d'explosion large (plus grave et long)
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const noise = Math.random() * 2 - 1;
            const envelope = Math.exp(-i / (bufferSize * 0.15));
            const frequency = 100 + (Math.random() * 200);
            const oscillation = Math.sin(2 * Math.PI * frequency * i / this.audioContext.sampleRate);
            data[i] = (noise + oscillation * 0.5) * envelope * 0.7;
        }
        
        this.largeExplosionBuffer = buffer;
    }
    
    createHyperspaceSound() {
        // Son d'hyperspace (effet de glitch)
        const bufferSize = this.audioContext.sampleRate * 0.2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            const frequency = 200 + Math.sin(t * Math.PI * 10) * 100;
            const phase = (i / this.audioContext.sampleRate) * frequency * 2 * Math.PI;
            data[i] = Math.sin(phase) * Math.exp(-t * 5);
        }
        
        this.hyperspaceBuffer = buffer;
    }
    
    playSound(name) {
        if (this.muted) return null;
        
        let buffer = null;
        switch(name) {
            case 'thrust': buffer = this.thrustBuffer; break;
            case 'shoot': buffer = this.shootBuffer; break;
            case 'explosion': buffer = this.explosionBuffer; break;
            case 'large_explosion': buffer = this.largeExplosionBuffer; break;
            case 'hyperspace': buffer = this.hyperspaceBuffer; break;
            default: return null;
        }
        
        if (!buffer) return null;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start();
        
        return source;
    }
    
    playThrust() {
        return this.playSound('thrust');
    }
    
    playShoot() {
        return this.playSound('shoot');
    }
    
    playExplosion() {
        return this.playSound('explosion');
    }
    
    playLargeExplosion() {
        return this.playSound('large_explosion');
    }
    
    playHyperspace() {
        return this.playSound('hyperspace');
    }
    
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
    
    setVolume(volume) {
        this.volume = Math.min(Math.max(volume, 0), 1);
    }
    
    getVolume() {
        return this.volume;
    }
    
    isMuted() {
        return this.muted;
    }
}

// Créer une instance globale
window.AudioManager = AudioManager;
