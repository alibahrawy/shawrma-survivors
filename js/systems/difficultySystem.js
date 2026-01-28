export class DifficultySystem {
    constructor(game) {
        this.game = game;

        // Multipliers (increase over time)
        this.spawnMultiplier = 1;
        this.hpMultiplier = 1;
        this.damageMultiplier = 1;

        // Difficulty breakpoints
        this.breakpoints = [
            { time: 0, spawn: 1.0, hp: 1.0, damage: 1.0 },
            { time: 30, spawn: 1.2, hp: 1.1, damage: 1.0 },
            { time: 60, spawn: 1.4, hp: 1.2, damage: 1.1 },
            { time: 120, spawn: 1.7, hp: 1.4, damage: 1.2 },
            { time: 180, spawn: 2.0, hp: 1.7, damage: 1.3 },
            { time: 300, spawn: 2.5, hp: 2.0, damage: 1.5 },
            { time: 480, spawn: 3.0, hp: 2.5, damage: 1.7 },
            { time: 600, spawn: 4.0, hp: 3.0, damage: 2.0 }
        ];
    }

    update(deltaTime) {
        const gameTime = this.game.gameTime;
        this.calculateMultipliers(gameTime);
    }

    calculateMultipliers(gameTime) {
        // Find current and next breakpoints
        let prevBreakpoint = this.breakpoints[0];
        let nextBreakpoint = this.breakpoints[this.breakpoints.length - 1];

        for (let i = 0; i < this.breakpoints.length - 1; i++) {
            if (gameTime >= this.breakpoints[i].time && gameTime < this.breakpoints[i + 1].time) {
                prevBreakpoint = this.breakpoints[i];
                nextBreakpoint = this.breakpoints[i + 1];
                break;
            }
        }

        // If past all breakpoints, use the last one
        if (gameTime >= this.breakpoints[this.breakpoints.length - 1].time) {
            const last = this.breakpoints[this.breakpoints.length - 1];
            this.spawnMultiplier = last.spawn;
            this.hpMultiplier = last.hp;
            this.damageMultiplier = last.damage;
            return;
        }

        // Linear interpolation between breakpoints
        const timeDiff = nextBreakpoint.time - prevBreakpoint.time;
        const progress = timeDiff > 0 ? (gameTime - prevBreakpoint.time) / timeDiff : 0;

        this.spawnMultiplier = this.lerp(prevBreakpoint.spawn, nextBreakpoint.spawn, progress);
        this.hpMultiplier = this.lerp(prevBreakpoint.hp, nextBreakpoint.hp, progress);
        this.damageMultiplier = this.lerp(prevBreakpoint.damage, nextBreakpoint.damage, progress);
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    modifyEnemyStats(config) {
        return {
            ...config,
            maxHealth: Math.floor(config.maxHealth * this.hpMultiplier),
            damage: Math.floor(config.damage * this.damageMultiplier)
        };
    }

    reset() {
        this.spawnMultiplier = 1;
        this.hpMultiplier = 1;
        this.damageMultiplier = 1;
    }
}
