import { Vector2 } from '../utils/vector.js';

// Base entity class - parent for all game objects
export class Entity {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.active = true;
        this.radius = 10;
        this.color = '#FFFFFF';
    }

    update(deltaTime) {
        // Apply velocity to position
        this.position = this.position.add(this.velocity.multiply(deltaTime));
    }

    render(ctx, camera) {
        // Override in subclasses
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    collidesWith(other) {
        const distance = this.position.distanceTo(other.position);
        return distance < (this.radius + other.radius);
    }

    isOnScreen(camera, margin = 100) {
        const screenX = this.position.x - camera.x;
        const screenY = this.position.y - camera.y;
        return (
            screenX > -margin &&
            screenX < camera.width + margin &&
            screenY > -margin &&
            screenY < camera.height + margin
        );
    }

    destroy() {
        this.active = false;
    }
}
