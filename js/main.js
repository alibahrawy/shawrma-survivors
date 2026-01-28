import { Game } from './game.js';

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);

    // Make game accessible for debugging
    window.game = game;

    console.log('Shawrma Survivors loaded!');
    console.log('Click START GAME to begin.');
});
