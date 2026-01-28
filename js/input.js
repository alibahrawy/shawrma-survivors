import { Vector2 } from './utils/vector.js';

// Handles keyboard input for player movement and game controls
export class InputSystem {
    constructor() {
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            pause: false
        };

        this.pausePressed = false;
        this.onPauseCallback = null;

        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.up = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.down = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'Escape':
                if (!this.pausePressed) {
                    this.pausePressed = true;
                    if (this.onPauseCallback) {
                        this.onPauseCallback();
                    }
                }
                break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
                // For upgrade selection
                this.lastNumberPressed = parseInt(e.code.replace('Digit', ''));
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.up = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.down = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'Escape':
                this.pausePressed = false;
                break;
        }
    }

    getMovementDirection() {
        let x = 0;
        let y = 0;

        if (this.keys.up) y -= 1;
        if (this.keys.down) y += 1;
        if (this.keys.left) x -= 1;
        if (this.keys.right) x += 1;

        return new Vector2(x, y);
    }

    onPause(callback) {
        this.onPauseCallback = callback;
    }

    getNumberPressed() {
        const num = this.lastNumberPressed;
        this.lastNumberPressed = null;
        return num;
    }
}
