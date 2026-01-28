// Sound system using Web Audio API - generates retro-style procedural sounds
export class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.masterVolume = null;
        this.enabled = true;
        this.volume = 0.3;

        // Initialize on first user interaction (required by browsers)
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterVolume = this.audioContext.createGain();
            this.masterVolume.gain.value = this.volume;
            this.masterVolume.connect(this.audioContext.destination);
            this.initialized = true;
            console.log('Sound system initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.masterVolume) {
            this.masterVolume.gain.value = this.volume;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Play a shoot/projectile sound
    playShoot() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Create oscillator for a quick "pew" sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Play enemy hit sound
    playHit() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Short impact sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Play enemy death sound
    playEnemyDeath() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Explosion-like sound with noise
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.2);

        // Add some noise for texture
        this.playNoise(0.15, 0.15);
    }

    // Play player hurt sound
    playPlayerHurt() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Low thud with wobble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.setValueAtTime(100, now + 0.05);
        osc.frequency.setValueAtTime(80, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Play XP gem pickup sound
    playPickup() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Coin-like ding
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.05);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Play level up sound
    playLevelUp() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Ascending fanfare
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            const startTime = now + i * 0.1;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

            osc.connect(gain);
            gain.connect(this.masterVolume);

            osc.start(startTime);
            osc.stop(startTime + 0.25);
        });
    }

    // Play game over sound
    playGameOver() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Sad descending tone
        const notes = [392, 349, 330, 262]; // G4, F4, E4, C4

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            const startTime = now + i * 0.2;
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.masterVolume);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    // Play start game sound
    playGameStart() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Quick upbeat jingle
        const notes = [262, 330, 392, 523]; // C4, E4, G4, C5

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0.12, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            osc.connect(gain);
            gain.connect(this.masterVolume);

            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }

    // Play aura damage tick
    playAuraTick() {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 440;

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start(now);
        osc.stop(now + 0.03);
    }

    // Helper: play white noise burst
    playNoise(duration, volume) {
        if (!this.enabled || !this.initialized) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.connect(gain);
        gain.connect(this.masterVolume);

        noise.start(now);
        noise.stop(now + duration);
    }
}

// Global sound instance
export const sound = new SoundSystem();
