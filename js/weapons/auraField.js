import { Weapon } from './weapon.js';
import { sound } from '../systems/soundSystem.js';

export class AuraField extends Weapon {
    constructor(owner) {
        super(owner, {
            id: 'aura_field',
            name: 'Aura Field',
            icon: '🔵',
            color: '#00BCD4',
            baseDamage: 8,
            baseAttackSpeed: 2,
            baseProjectileSize: 80,
            firesWithoutTarget: true,
            levelBonuses: [
                { projectileSize: 20 },                 // Level 2
                { damage: 4 },                          // Level 3
                { projectileSize: 25 },                 // Level 4
                { damage: 6 },                          // Level 5
                { projectileSize: 30 },                 // Level 6
                { damage: 8 },                          // Level 7
                { projectileSize: 40, damage: 10 }      // Level 8
            ]
        });

        this.knockbackForce = 80;
        this.pulseTime = 0;
    }

    getAuraRadius() {
        return (this.baseProjectileSize + this.getLevelBonus('projectileSize'))
            * this.owner.stats.projectileSizeMult;
    }

    fire(target, enemies) {
        const radius = this.getAuraRadius();
        const damagePerTick = this.getDamage() / this.getAttackSpeed();
        let hitAny = false;

        for (const enemy of enemies) {
            if (!enemy.active) continue;

            const dist = this.owner.position.distanceTo(enemy.position);
            if (dist < radius + enemy.radius) {
                enemy.takeDamage(damagePerTick);
                hitAny = true;

                // Knockback at higher levels
                if (this.level >= 6) {
                    const pushDir = enemy.position.subtract(this.owner.position).normalize();
                    enemy.position = enemy.position.add(pushDir.multiply(this.knockbackForce * 0.016));
                }
            }
        }

        if (hitAny) {
            sound.playAuraTick();
        }

        this.pulseTime = 0.2;
        return null;
    }

    update(deltaTime, enemies) {
        if (this.pulseTime > 0) {
            this.pulseTime -= deltaTime;
        }
        return super.update(deltaTime, enemies);
    }

    render(ctx, camera) {
        const screenX = this.owner.position.x - camera.x;
        const screenY = this.owner.position.y - camera.y;
        const radius = this.getAuraRadius();

        // Pulsing effect
        const pulseScale = this.pulseTime > 0 ? 1 + this.pulseTime * 0.5 : 1;
        const pulseRadius = radius * pulseScale;

        // Outer glow
        const gradient = ctx.createRadialGradient(
            screenX, screenY, pulseRadius * 0.3,
            screenX, screenY, pulseRadius
        );
        gradient.addColorStop(0, 'rgba(0, 188, 212, 0.25)');
        gradient.addColorStop(0.7, 'rgba(0, 188, 212, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 188, 212, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseRadius, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring
        ctx.strokeStyle = `rgba(0, 188, 212, ${0.4 + this.pulseTime})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseRadius * 0.95, 0, Math.PI * 2);
        ctx.stroke();

        // Outer ring
        ctx.strokeStyle = 'rgba(0, 188, 212, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
}
