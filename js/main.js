import { Game } from './game.js';
import { resources } from './utils/resourceManager.js';

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Loading resources...');
        await resources.loadAll();
        console.log('Resources loaded!');

        const canvas = document.getElementById('game-canvas');
        const game = new Game(canvas);

        // Make game accessible for debugging
        window.game = game;

        console.log('Shawrma Survivors loaded!');
        console.log('Click START GAME to begin.');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});
