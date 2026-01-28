import { Player } from './entities/player.js';
import { InputSystem } from './input.js';
import { SpawnSystem } from './systems/spawnSystem.js';
import { CollisionSystem } from './systems/collisionSystem.js';
import { UpgradeSystem } from './systems/upgradeSystem.js';
import { DifficultySystem } from './systems/difficultySystem.js';
import { MagicMissile } from './weapons/magicMissile.js';
import { sound } from './systems/soundSystem.js';
import { resources } from './utils/resourceManager.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Camera (follows player) - must be initialized before resizeCanvas
        this.camera = {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
        };

        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Game state
        this.state = 'menu'; // 'menu', 'playing', 'paused', 'levelup', 'gameover'
        this.gameTime = 0;

        // Entities
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.xpGems = [];

        // Systems
        this.input = new InputSystem();
        this.spawnSystem = null;
        this.collisionSystem = null;
        this.upgradeSystem = null;
        this.difficultySystem = null;

        // Stats
        this.stats = {
            enemiesKilled: 0,
            damageDealt: 0,
            damageTaken: 0,
            xpCollected: 0,
            highestLevel: 1
        };

        // Delta time
        this.lastTime = 0;

        // Setup input callbacks
        this.input.onPause(() => this.togglePause());

        // UI elements
        this.setupUI();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }

    setupUI() {
        // Start button
        const startBtn = document.getElementById('start-button');
        console.log('Start button found:', startBtn);
        startBtn.addEventListener('click', () => {
            console.log('Start button clicked!');
            this.start();
        });

        // Restart button
        document.getElementById('restart-button').addEventListener('click', () => {
            console.log('Restart button clicked!');
            this.start();
        });

        // Upgrade choices (keyboard)
        window.addEventListener('keydown', (e) => {
            if (this.state === 'levelup') {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 3) {
                    this.selectUpgrade(num - 1);
                }
            }
        });
    }

    start() {
        try {
            console.log('Starting game...');

            // Initialize sound on first user interaction
            sound.init();
            sound.playGameStart();

            this.state = 'playing';
            this.gameTime = 0;

            // Create player at center
            console.log('Creating player...');
            this.player = new Player(0, 0);

            // Give starting weapon
            console.log('Adding weapon...');
            this.player.weapons.push(new MagicMissile(this.player));

            // Clear entities
            this.enemies = [];
            this.projectiles = [];
            this.xpGems = [];

            // Initialize systems
            console.log('Initializing systems...');
            this.spawnSystem = new SpawnSystem(this);
            this.collisionSystem = new CollisionSystem(this);
            this.upgradeSystem = new UpgradeSystem(this);
            this.difficultySystem = new DifficultySystem(this);

            // Reset stats
            this.stats = {
                enemiesKilled: 0,
                damageDealt: 0,
                damageTaken: 0,
                xpCollected: 0,
                highestLevel: 1
            };

            // Hide overlays
            console.log('Hiding overlays...');
            this.hideAllOverlays();

            // Start game loop
            console.log('Starting game loop...');
            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));
            console.log('Game started successfully!');
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }

    gameLoop(currentTime) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        if (this.state === 'playing') {
            this.update(deltaTime);
        }

        this.render();
        this.updateHUD();

        if (this.state !== 'gameover') {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    update(deltaTime) {
        this.gameTime += deltaTime;

        // Update difficulty
        this.difficultySystem.update(deltaTime);

        // Update player
        const inputDir = this.input.getMovementDirection();
        this.player.update(deltaTime, inputDir);

        // Update camera
        this.camera.x = this.player.position.x - this.canvas.width / 2;
        this.camera.y = this.player.position.y - this.canvas.height / 2;

        // Update weapons
        for (const weapon of this.player.weapons) {
            const newProjectiles = weapon.update(deltaTime, this.enemies);
            if (newProjectiles) {
                this.projectiles.push(...newProjectiles);
            }
        }

        // Update enemies
        for (const enemy of this.enemies) {
            if (enemy.active) {
                enemy.update(deltaTime, this.player.position);
            }
        }

        // Update projectiles
        for (const projectile of this.projectiles) {
            if (projectile.active) {
                projectile.update(deltaTime);
            }
        }

        // Update XP gems
        for (const gem of this.xpGems) {
            if (gem.active) {
                gem.update(deltaTime, this.player.position, this.player.getEffectivePickupRadius());
            }
        }

        // Spawn enemies
        this.spawnSystem.update(deltaTime);

        // Check collisions
        this.collisionSystem.update();

        // Cleanup
        this.cleanup();
    }

    cleanup() {
        this.enemies = this.enemies.filter(e => e.active);
        this.projectiles = this.projectiles.filter(p => p.active);
        this.xpGems = this.xpGems.filter(g => g.active);
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid/background
        this.renderBackground();

        // Draw XP gems
        for (const gem of this.xpGems) {
            if (gem.active && gem.isOnScreen(this.camera)) {
                gem.render(this.ctx, this.camera);
            }
        }

        // Draw enemies
        for (const enemy of this.enemies) {
            if (enemy.active && enemy.isOnScreen(this.camera)) {
                enemy.render(this.ctx, this.camera);
            }
        }

        // Draw projectiles
        for (const projectile of this.projectiles) {
            if (projectile.active && projectile.isOnScreen(this.camera)) {
                projectile.render(this.ctx, this.camera);
            }
        }

        // Draw weapon effects (before player)
        for (const weapon of this.player?.weapons || []) {
            weapon.render(this.ctx, this.camera);
        }

        // Draw player
        if (this.player) {
            this.player.render(this.ctx, this.camera);
        }
    }

    renderBackground() {
        const floorImg = resources.getImage('floor_tile');
        if (!floorImg) return;

        const tileSize = 64; // Assuming 64x64 or scaling to it. Our generated one might be different, let's assume it fits well or scale it.
        // Actually, the generated image size isn't guaranteed. Let's draw it as is.
        // But for pixel art, usually we want crisp scaling.
        // Let's assume standard tile size or use the image natural size.
        const width = floorImg.width;
        const height = floorImg.height;

        const offsetX = -this.camera.x % width;
        const offsetY = -this.camera.y % height;

        // Calculate how many tiles we need to cover the screen plus buffer
        const cols = Math.ceil(this.canvas.width / width) + 1;
        const rows = Math.ceil(this.canvas.height / height) + 1;

        // Ensure crisp pixel art rendering (should be set in context globally, but confirming here)
        this.ctx.imageSmoothingEnabled = false;

        for (let y = -1; y < rows; y++) {
            for (let x = -1; x < cols; x++) {
                this.ctx.drawImage(
                    floorImg,
                    offsetX + x * width,
                    offsetY + y * height
                );
            }
        }
    }

    updateHUD() {
        if (!this.player) return;

        // Health bar
        const healthPercent = (this.player.health / this.player.getEffectiveMaxHealth()) * 100;
        document.getElementById('health-bar').style.width = `${healthPercent}%`;
        document.getElementById('health-text').textContent =
            `${Math.ceil(this.player.health)}/${this.player.getEffectiveMaxHealth()}`;

        // XP bar
        const xpPercent = (this.player.xp / this.player.xpToNextLevel) * 100;
        document.getElementById('xp-bar').style.width = `${xpPercent}%`;
        document.getElementById('xp-text').textContent =
            `${this.player.xp}/${this.player.xpToNextLevel}`;

        // Timer
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        document.getElementById('timer').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Level
        document.getElementById('level').textContent = `Level ${this.player.level}`;

        // Weapons display
        const weaponsDiv = document.getElementById('weapons-display');
        weaponsDiv.innerHTML = '';
        for (const weapon of this.player.weapons) {
            const weaponEl = document.createElement('div');
            weaponEl.className = 'weapon-icon';
            weaponEl.innerHTML = `
                <span>${weapon.icon}</span>
                <span class="weapon-level">Lv${weapon.level}</span>
            `;
            weaponsDiv.appendChild(weaponEl);
        }
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

    onLevelUp() {
        this.state = 'levelup';
        sound.playLevelUp();

        if (this.player.level > this.stats.highestLevel) {
            this.stats.highestLevel = this.player.level;
        }

        // Generate upgrade choices
        const choices = this.upgradeSystem.generateChoices(3);
        this.showUpgradeScreen(choices);
    }

    showUpgradeScreen(choices) {
        const container = document.getElementById('upgrade-choices');
        container.innerHTML = '';

        choices.forEach((choice, index) => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.innerHTML = `
                <div class="upgrade-icon">${choice.icon}</div>
                <div class="upgrade-name">${choice.name}</div>
                <div class="upgrade-desc">${choice.description}</div>
                <div class="upgrade-key">[${index + 1}]</div>
            `;
            card.addEventListener('click', () => this.selectUpgrade(index));
            container.appendChild(card);
        });

        document.getElementById('levelup-screen').classList.remove('hidden');
    }

    selectUpgrade(index) {
        if (this.state !== 'levelup') return;

        this.upgradeSystem.applyUpgrade(index);
        document.getElementById('levelup-screen').classList.add('hidden');
        this.state = 'playing';
    }

    onPlayerDeath() {
        this.state = 'gameover';
        sound.playGameOver();

        // Update final stats display
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        document.getElementById('final-time').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('final-level').textContent = this.stats.highestLevel;
        document.getElementById('final-kills').textContent = this.stats.enemiesKilled;

        document.getElementById('gameover-screen').classList.remove('hidden');
    }

    hideAllOverlays() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('levelup-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
    }
}
