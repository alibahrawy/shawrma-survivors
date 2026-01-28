import { XPGem } from '../entities/xpGem.js';
import { sound } from './soundSystem.js';

export class CollisionSystem {
    constructor(game) {
        this.game = game;
    }

    update() {
        this.checkProjectileEnemyCollisions();
        this.checkEnemyPlayerCollisions();
        this.checkGemPlayerCollisions();
    }

    checkProjectileEnemyCollisions() {
        const { projectiles, enemies, player } = this.game;

        for (const projectile of projectiles) {
            if (!projectile.active) continue;

            for (const enemy of enemies) {
                if (!enemy.active) continue;

                if (projectile.collidesWith(enemy)) {
                    if (projectile.onHitEnemy(enemy)) {
                        const died = enemy.takeDamage(projectile.damage);
                        sound.playHit();

                        if (died) {
                            this.onEnemyDeath(enemy);
                        }
                    }
                }
            }
        }
    }

    checkEnemyPlayerCollisions() {
        const { enemies, player } = this.game;

        for (const enemy of enemies) {
            if (!enemy.active) continue;

            if (enemy.collidesWith(player)) {
                const wasInvincible = player.invincibilityTime > 0;
                const died = player.takeDamage(enemy.damage);

                // Play hurt sound if damage was actually taken
                if (!wasInvincible && !died) {
                    sound.playPlayerHurt();
                }

                if (died) {
                    this.game.onPlayerDeath();
                }
            }
        }
    }

    checkGemPlayerCollisions() {
        const { xpGems, player } = this.game;
        const collectRadius = player.radius + 5;

        for (const gem of xpGems) {
            if (!gem.active) continue;

            const dist = gem.position.distanceTo(player.position);

            if (dist < collectRadius) {
                const leveledUp = player.gainXP(gem.xpValue);
                gem.destroy();
                sound.playPickup();

                this.game.stats.xpCollected += gem.xpValue;

                if (leveledUp) {
                    this.game.onLevelUp();
                }
            }
        }
    }

    onEnemyDeath(enemy) {
        // Spawn XP gem
        const gem = new XPGem(enemy.position.x, enemy.position.y, enemy.xpValue);
        this.game.xpGems.push(gem);
        sound.playEnemyDeath();

        // Update stats
        this.game.stats.enemiesKilled++;
    }
}
