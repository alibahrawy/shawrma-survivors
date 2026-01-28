import { Entity } from './entity.js';

export class Projectile extends Entity {
    constructor(x, y, config) {
        super(x, y);
        this.radius = config.radius || 6;
        this.color = config.color || '#FFEB3B';

        this.damage = config.damage || 10;
        this.speed = config.speed || 400;
        this.lifetime = config.lifetime || 3;
        this.timeAlive = 0;

        this.piercing = config.piercing || 0;
        this.hitCount = 0;
        this.hitEnemies = new Set();

        this.weaponId = config.weaponId;

        // Set initial velocity
        if (config.direction) {
            this.velocity = config.direction.normalize().multiply(this.speed);
        } else if (config.targetPosition) {
            const dir = config.targetPosition.subtract(this.position).normalize();
            this.velocity = dir.multiply(this.speed);
        }
    }

    update(deltaTime) {
        this.timeAlive += deltaTime;
        if (this.timeAlive >= this.lifetime) {
            this.destroy();
            return;
        }
        super.update(deltaTime);
    }

    onHitEnemy(enemy) {
        if (this.hitEnemies.has(enemy)) return false;

        this.hitEnemies.add(enemy);
        this.hitCount++;

        if (this.hitCount > this.piercing) {
            this.destroy();
        }

        return true; // Damage should be applied
    }

    render(ctx, camera) {
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y;

        // Trail effect
        const trailLength = 3;
        const velNorm = this.velocity.normalize();
        for (let i = trailLength; i > 0; i--) {
            const trailX = screenX - velNorm.x * i * 4;
            const trailY = screenY - velNorm.y * i * 4;
            const alpha = (1 - i / trailLength) * 0.3;
            ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(trailX, trailY, this.radius * (1 - i * 0.15), 0, Math.PI * 2);
            ctx.fill();
        }

        // Glow
        ctx.fillStyle = this.color + '60';
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius + 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(screenX - 2, screenY - 2, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
}
