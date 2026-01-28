import { Entity } from './entity.js';
import { Vector2 } from '../utils/vector.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y);
        this.radius = 18;
        this.color = '#4CAF50';

        // Core stats
        this.maxHealth = 100;
        this.health = 100;
        this.speed = 200;

        // XP and leveling
        this.xp = 0;
        this.level = 1;
        this.xpToNextLevel = 10;

        // Weapons array
        this.weapons = [];

        // Stat multipliers (affected by upgrades)
        this.stats = {
            maxHealthMult: 1.0,
            speedMult: 1.0,
            damageMult: 1.0,
            attackSpeedMult: 1.0,
            projectileSpeedMult: 1.0,
            projectileSizeMult: 1.0,
            pickupRadiusMult: 1.0,
            armorFlat: 0,
            regenPerSecond: 0,
            xpGainMult: 1.0
        };

        // Pickup radius for XP gems
        this.pickupRadius = 60;

        // Invincibility after taking damage
        this.invincibilityTime = 0;
        this.invincibilityDuration = 0.5;

        // Visual flash when hit
        this.flashTime = 0;
    }

    getEffectiveSpeed() {
        return this.speed * this.stats.speedMult;
    }

    getEffectiveMaxHealth() {
        return Math.floor(this.maxHealth * this.stats.maxHealthMult);
    }

    getEffectivePickupRadius() {
        return this.pickupRadius * this.stats.pickupRadiusMult;
    }

    takeDamage(amount) {
        if (this.invincibilityTime > 0) return false;

        const reducedDamage = Math.max(1, amount - this.stats.armorFlat);
        this.health -= reducedDamage;
        this.invincibilityTime = this.invincibilityDuration;
        this.flashTime = 0.1;

        if (this.health <= 0) {
            this.health = 0;
            return true; // Player died
        }
        return false;
    }

    heal(amount) {
        this.health = Math.min(this.getEffectiveMaxHealth(), this.health + amount);
    }

    gainXP(amount) {
        const adjustedAmount = Math.floor(amount * this.stats.xpGainMult);
        this.xp += adjustedAmount;

        if (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            // XP required increases each level
            this.xpToNextLevel = Math.floor(10 * Math.pow(1.15, this.level - 1));
            return true; // Level up occurred
        }
        return false;
    }

    update(deltaTime, inputDirection) {
        // Movement
        if (inputDirection.magnitude() > 0) {
            this.velocity = inputDirection.normalize().multiply(this.getEffectiveSpeed());
        } else {
            this.velocity = new Vector2(0, 0);
        }

        // Invincibility cooldown
        if (this.invincibilityTime > 0) {
            this.invincibilityTime -= deltaTime;
        }

        // Flash cooldown
        if (this.flashTime > 0) {
            this.flashTime -= deltaTime;
        }

        // Health regeneration
        if (this.stats.regenPerSecond > 0) {
            this.health = Math.min(
                this.getEffectiveMaxHealth(),
                this.health + this.stats.regenPerSecond * deltaTime
            );
        }

        super.update(deltaTime);
    }

    render(ctx, camera) {
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y;

        // Draw pickup radius indicator (faint circle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.getEffectivePickupRadius(), 0, Math.PI * 2);
        ctx.stroke();

        // Body - flash white when hit, blink when invincible
        let bodyColor = this.color;
        if (this.flashTime > 0) {
            bodyColor = '#FFFFFF';
        } else if (this.invincibilityTime > 0) {
            // Blink effect
            bodyColor = Math.floor(this.invincibilityTime * 10) % 2 === 0 ? this.color : '#88FF88';
        }

        // Outer glow
        ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        // Main body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(screenX - 5, screenY - 5, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}
