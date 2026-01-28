import { Weapon } from './weapon.js';
import { Vector2 } from '../utils/vector.js';
import { sound } from '../systems/soundSystem.js';

export class SpinningOrb extends Weapon {
    constructor(owner) {
        super(owner, {
            id: 'spinning_orb',
            name: 'Spinning Orb',
            icon: '🔴',
            color: '#FF5722',
            baseDamage: 18,
            baseAttackSpeed: 1.5,
            baseProjectileSize: 12,
            baseProjectileCount: 2,
            firesWithoutTarget: true,
            levelBonuses: [
                { projectileCount: 1 },                 // Level 2
                { damage: 8 },                          // Level 3
                { projectileCount: 1 },                 // Level 4
                { orbitRadius: 25 },                    // Level 5
                { damage: 12 },                         // Level 6
                { projectileCount: 1 },                 // Level 7
                { projectileCount: 1, orbitSpeed: 0.5 } // Level 8
            ]
        });

        this.baseOrbitRadius = 90;
        this.baseOrbitSpeed = 2;
        this.orbitAngle = 0;
        this.hitCooldowns = new Map();
        this.hitCooldownDuration = 0.4;
    }

    getOrbitRadius() {
        return this.baseOrbitRadius + this.getLevelBonus('orbitRadius');
    }

    getOrbitSpeed() {
        return (this.baseOrbitSpeed + this.getLevelBonus('orbitSpeed')) * Math.PI * 2;
    }

    getOrbSize() {
        return this.baseProjectileSize * this.owner.stats.projectileSizeMult;
    }

    update(deltaTime, enemies) {
        // Update orbit angle
        this.orbitAngle += this.getOrbitSpeed() * deltaTime;

        // Update hit cooldowns
        for (const [enemy, cooldown] of this.hitCooldowns.entries()) {
            const newCooldown = cooldown - deltaTime;
            if (newCooldown <= 0) {
                this.hitCooldowns.delete(enemy);
            } else {
                this.hitCooldowns.set(enemy, newCooldown);
            }
        }

        // Check collisions with enemies
        const orbPositions = this.getOrbPositions();
        const orbRadius = this.getOrbSize();

        for (const enemy of enemies) {
            if (!enemy.active) continue;
            if (this.hitCooldowns.has(enemy)) continue;

            for (const orbPos of orbPositions) {
                const dist = orbPos.distanceTo(enemy.position);
                if (dist < orbRadius + enemy.radius) {
                    enemy.takeDamage(this.getDamage());
                    this.hitCooldowns.set(enemy, this.hitCooldownDuration);
                    sound.playHit();
                    break;
                }
            }
        }

        return null;
    }

    getOrbPositions() {
        const positions = [];
        const count = this.getProjectileCount();
        const radius = this.getOrbitRadius();

        for (let i = 0; i < count; i++) {
            const angle = this.orbitAngle + (i / count) * Math.PI * 2;
            const x = this.owner.position.x + Math.cos(angle) * radius;
            const y = this.owner.position.y + Math.sin(angle) * radius;
            positions.push(new Vector2(x, y));
        }

        return positions;
    }

    render(ctx, camera) {
        const orbPositions = this.getOrbPositions();
        const orbRadius = this.getOrbSize();

        // Draw orbit path
        const screenX = this.owner.position.x - camera.x;
        const screenY = this.owner.position.y - camera.y;
        ctx.strokeStyle = 'rgba(255, 87, 34, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.getOrbitRadius(), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw orbs
        for (const pos of orbPositions) {
            const orbScreenX = pos.x - camera.x;
            const orbScreenY = pos.y - camera.y;

            // Trail
            const trailAngle = this.orbitAngle - 0.3;
            for (let i = 3; i > 0; i--) {
                const trailAlpha = (1 - i / 3) * 0.3;
                const trailRadius = orbRadius * (1 - i * 0.1);
                ctx.fillStyle = `rgba(255, 87, 34, ${trailAlpha})`;
                ctx.beginPath();
                ctx.arc(
                    orbScreenX - Math.cos(this.orbitAngle) * i * 3,
                    orbScreenY - Math.sin(this.orbitAngle) * i * 3,
                    trailRadius,
                    0, Math.PI * 2
                );
                ctx.fill();
            }

            // Glow
            ctx.fillStyle = 'rgba(255, 87, 34, 0.4)';
            ctx.beginPath();
            ctx.arc(orbScreenX, orbScreenY, orbRadius + 5, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(orbScreenX, orbScreenY, orbRadius, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(orbScreenX - 3, orbScreenY - 3, orbRadius * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
