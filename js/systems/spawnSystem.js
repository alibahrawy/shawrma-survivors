import { Enemy } from '../entities/enemy.js';
import { ENEMY_TYPES, getRandomEnemyType } from '../data/enemyTypes.js';
import { Vector2 } from '../utils/vector.js';

export class SpawnSystem {
    constructor(game) {
        this.game = game;

        // Spawn timing
        this.spawnTimer = 0;
        this.baseSpawnInterval = 2.0;

        // Spawn configuration
        this.baseEnemiesPerWave = 3;
        this.spawnDistance = 400; // Distance from player to spawn

        // Enemy type unlocking based on game time
        this.enemyUnlockTimes = {
            zombie: 0,
            bat: 30,      // Unlock at 30 seconds
            skeleton: 60, // Unlock at 1 minute
            golem: 120    // Unlock at 2 minutes
        };
    }

    update(deltaTime) {
        this.spawnTimer -= deltaTime;

        if (this.spawnTimer <= 0) {
            this.spawnWave();
            this.spawnTimer = this.getSpawnInterval();
        }
    }

    getSpawnInterval() {
        const difficulty = this.game.difficultySystem;
        return this.baseSpawnInterval / difficulty.spawnMultiplier;
    }

    getEnemiesPerWave() {
        const difficulty = this.game.difficultySystem;
        return Math.floor(this.baseEnemiesPerWave * difficulty.spawnMultiplier);
    }

    getAvailableEnemyTypes() {
        const gameTime = this.game.gameTime;
        const available = [];

        for (const [type, unlockTime] of Object.entries(this.enemyUnlockTimes)) {
            if (gameTime >= unlockTime) {
                available.push(type);
            }
        }

        return available;
    }

    spawnWave() {
        const count = this.getEnemiesPerWave();
        const availableTypes = this.getAvailableEnemyTypes();

        for (let i = 0; i < count; i++) {
            this.spawnEnemy(availableTypes);
        }
    }

    spawnEnemy(availableTypes) {
        // Get spawn position (off-screen around player)
        const position = this.getSpawnPosition();

        // Get random enemy type
        const config = getRandomEnemyType(availableTypes);

        // Apply difficulty scaling
        const scaledConfig = this.game.difficultySystem.modifyEnemyStats(config);

        // Create enemy
        const enemy = new Enemy(position.x, position.y, scaledConfig);
        this.game.enemies.push(enemy);
    }

    getSpawnPosition() {
        const player = this.game.player;
        const camera = this.game.camera;

        // Random angle around player
        const angle = Math.random() * Math.PI * 2;

        // Spawn just outside camera view
        const distance = Math.max(camera.width, camera.height) / 2 + 50;

        return new Vector2(
            player.position.x + Math.cos(angle) * distance,
            player.position.y + Math.sin(angle) * distance
        );
    }

    // Spawn a burst of enemies (for events/bosses)
    spawnBurst(count, enemyType = null) {
        const availableTypes = enemyType ? [enemyType] : this.getAvailableEnemyTypes();

        for (let i = 0; i < count; i++) {
            this.spawnEnemy(availableTypes);
        }
    }
}
