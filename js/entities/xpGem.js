import { Entity } from './entity.js';
import { Vector2 } from '../utils/vector.js';
import { resources } from '../utils/resourceManager.js';

export class XPGem extends Entity {
    constructor(x, y, value = 1) {
        super(x, y);
        this.xpValue = value;

        // Size based on value
        this.radius = 5 + Math.min(value * 2, 8);

        // Color based on value
        if (value >= 10) {
            this.color = '#E91E63'; // Pink (rare)
        } else if (value >= 5) {
            this.color = '#2196F3'; // Blue (uncommon)
        } else {
            this.color = '#4CAF50'; // Green (common)
        }

        // Attraction state
        this.isAttracted = false;
        this.attractionSpeed = 400;

        // Spawn scatter animation
        this.spawnVelocity = Vector2.fromAngle(
            Math.random() * Math.PI * 2,
            80 + Math.random() * 40
        );
        this.spawnTime = 0.25;

        // Bobbing animation
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobTime = 0;
    }

    update(deltaTime, playerPosition, pickupRadius) {
        this.bobTime += deltaTime * 3;

        // Spawn scatter effect
        if (this.spawnTime > 0) {
            this.spawnTime -= deltaTime;
            this.position = this.position.add(this.spawnVelocity.multiply(deltaTime));
            this.spawnVelocity = this.spawnVelocity.multiply(0.92);
            return;
        }

        const distToPlayer = this.position.distanceTo(playerPosition);

        // Start attraction when in pickup radius
        if (distToPlayer < pickupRadius) {
            this.isAttracted = true;
        }

        // Move toward player when attracted
        if (this.isAttracted) {
            const direction = playerPosition.subtract(this.position).normalize();
            this.velocity = direction.multiply(this.attractionSpeed);
            this.attractionSpeed += 800 * deltaTime; // Accelerate
        } else {
            this.velocity = new Vector2(0, 0);
        }

        super.update(deltaTime);
    }

    render(ctx, camera) {
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y + Math.sin(this.bobTime + this.bobOffset) * 3;

        let spriteKey = 'gem_green';
        if (this.xpValue >= 10) spriteKey = 'gem_pink';
        else if (this.xpValue >= 5) spriteKey = 'gem_blue';

        const sprite = resources.getImage(spriteKey);

        if (sprite) {
            const size = this.radius * 3; // Scale
            ctx.imageSmoothingEnabled = false;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY + size / 2 - 2, size / 3, size / 6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.drawImage(sprite, screenX - size / 2, screenY - size / 2, size, size);
        } else {
            // Glow
            ctx.fillStyle = this.color + '40'; // 25% opacity
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius + 4, 0, Math.PI * 2);
            ctx.fill();

            // Diamond shape
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - this.radius);
            ctx.lineTo(screenX + this.radius * 0.7, screenY);
            ctx.lineTo(screenX, screenY + this.radius);
            ctx.lineTo(screenX - this.radius * 0.7, screenY);
            ctx.closePath();
            ctx.fill();

            // Shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(screenX - 2, screenY - 3, this.radius * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
