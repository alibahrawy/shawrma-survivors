import { Entity } from './entity.js';
import { Vector2 } from '../utils/vector.js';
import { resources } from '../utils/resourceManager.js';

export class Enemy extends Entity {
    constructor(x, y, config) {
        super(x, y);
        this.type = config.type;
        this.radius = config.radius || 14;
        this.color = config.color || '#F44336';

        this.maxHealth = config.maxHealth || 10;
        this.health = this.maxHealth;
        this.speed = config.speed || 80;
        this.damage = config.damage || 10;
        this.xpValue = config.xpValue || 1;

        // Behavior configuration
        this.behaviorType = config.behaviorType || 'chase';
        this.behaviorState = 'approaching';
        this.behaviorTimer = 0;

        // For erratic movement (bat)
        this.erraticAngle = 0;
        this.erraticTimer = 0;

        // For charging (skeleton)
        this.chargeSpeed = config.chargeSpeed || 300;
        this.preferredDistance = config.preferredDistance || 150;
        this.chargeDirection = new Vector2(0, 0);

        // Visual effects
        this.flashTime = 0;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.flashTime = 0.1;

        if (this.health <= 0) {
            this.destroy();
            return true; // Enemy died
        }
        return false;
    }

    update(deltaTime, playerPosition) {
        this.updateBehavior(deltaTime, playerPosition);

        if (this.flashTime > 0) {
            this.flashTime -= deltaTime;
        }

        super.update(deltaTime);
    }

    updateBehavior(deltaTime, playerPosition) {
        switch (this.behaviorType) {
            case 'chase':
                this.chasePlayer(playerPosition);
                break;
            case 'erratic':
                this.erraticMovement(deltaTime, playerPosition);
                break;
            case 'charger':
                this.chargerBehavior(deltaTime, playerPosition);
                break;
            case 'tank':
                this.tankBehavior(playerPosition);
                break;
        }
    }

    chasePlayer(playerPosition) {
        const direction = playerPosition.subtract(this.position).normalize();
        this.velocity = direction.multiply(this.speed);
    }

    erraticMovement(deltaTime, playerPosition) {
        this.erraticTimer -= deltaTime;
        if (this.erraticTimer <= 0) {
            this.erraticAngle = (Math.random() - 0.5) * Math.PI;
            this.erraticTimer = 0.15 + Math.random() * 0.2;
        }

        const toPlayer = playerPosition.subtract(this.position);
        const baseAngle = toPlayer.angle();
        const erraticDir = Vector2.fromAngle(baseAngle + this.erraticAngle);
        this.velocity = erraticDir.multiply(this.speed);
    }

    chargerBehavior(deltaTime, playerPosition) {
        const dist = this.position.distanceTo(playerPosition);

        switch (this.behaviorState) {
            case 'approaching':
                if (dist < this.preferredDistance) {
                    this.behaviorState = 'winding';
                    this.behaviorTimer = 0.5;
                    this.chargeDirection = playerPosition.subtract(this.position).normalize();
                    this.velocity = new Vector2(0, 0);
                } else {
                    const dir = playerPosition.subtract(this.position).normalize();
                    this.velocity = dir.multiply(this.speed);
                }
                break;

            case 'winding':
                this.behaviorTimer -= deltaTime;
                this.velocity = new Vector2(0, 0);
                if (this.behaviorTimer <= 0) {
                    this.behaviorState = 'charging';
                    this.behaviorTimer = 0.6;
                }
                break;

            case 'charging':
                this.velocity = this.chargeDirection.multiply(this.chargeSpeed);
                this.behaviorTimer -= deltaTime;
                if (this.behaviorTimer <= 0) {
                    this.behaviorState = 'cooldown';
                    this.behaviorTimer = 0.5;
                }
                break;

            case 'cooldown':
                this.velocity = new Vector2(0, 0);
                this.behaviorTimer -= deltaTime;
                if (this.behaviorTimer <= 0) {
                    this.behaviorState = 'approaching';
                }
                break;
        }
    }

    tankBehavior(playerPosition) {
        // Slow, direct pursuit
        const direction = playerPosition.subtract(this.position).normalize();
        this.velocity = direction.multiply(this.speed);
    }

    render(ctx, camera) {
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y;

        const sprite = resources.getImage(this.type);

        if (sprite) {
            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY + 10, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Determine orientation
            if (this.velocity.x !== 0) {
                this.facingLeft = this.velocity.x < 0;
            }

            ctx.save();
            ctx.translate(screenX, screenY);
            if (this.facingLeft) {
                ctx.scale(-1, 1);
            }

            const size = this.radius * 3.5; // Scale sprite relative to hit radius
            ctx.imageSmoothingEnabled = false;

            // Flash white when hit
            if (this.flashTime > 0) {
                // Simple flash effect by not drawing or drawing white rect overlay
                // Since we can't easily tint image white without another canvas or filter in 2d context (without performance hit)
                // We'll use a brightness filter if compatible, or just globalAlpha for now to show hit.
                // or skip drawing every other frame to "flash"
                ctx.globalAlpha = 0.5;
            }

            ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
            ctx.restore();

            // Charge indicator for skeleton (keep existing logic or overlay)
            if (this.behaviorType === 'charger' && this.behaviorState === 'winding') {
                ctx.strokeStyle = '#FF5722';
                ctx.lineWidth = 2; // thinner
                ctx.beginPath();
                ctx.arc(screenX, screenY, this.radius + 10, 0, Math.PI * 2);
                ctx.stroke();
            }

        } else {
            // Flash white when hit
            const renderColor = this.flashTime > 0 ? '#FFFFFF' : this.color;

            // Enemy body
            ctx.fillStyle = renderColor;
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // Border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Charge indicator for skeleton
            if (this.behaviorType === 'charger' && this.behaviorState === 'winding') {
                ctx.strokeStyle = '#FF5722';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(screenX, screenY, this.radius + 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // Health bar (keep, but maybe style it a bit smaller/pixelated)
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barY = screenY - this.radius - 15;

        // Only show health bar if damaged
        if (this.health < this.maxHealth) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);

            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
            ctx.fillRect(screenX - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        }
    }
}
