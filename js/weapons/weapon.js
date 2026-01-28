// Base weapon class - parent for all weapons
export class Weapon {
    constructor(owner, config) {
        this.owner = owner;
        this.id = config.id;
        this.name = config.name;
        this.color = config.color || '#FFEB3B';
        this.icon = config.icon || '⚔️';

        // Base stats
        this.baseDamage = config.baseDamage || 10;
        this.baseAttackSpeed = config.baseAttackSpeed || 1;
        this.baseProjectileSpeed = config.baseProjectileSpeed || 400;
        this.baseProjectileSize = config.baseProjectileSize || 6;
        this.basePiercing = config.basePiercing || 0;
        this.baseProjectileCount = config.baseProjectileCount || 1;

        // Weapon level
        this.level = 1;
        this.maxLevel = 8;

        // Cooldown tracking
        this.cooldown = 0;

        // Level bonuses
        this.levelBonuses = config.levelBonuses || [];

        // Some weapons fire without a target
        this.firesWithoutTarget = config.firesWithoutTarget || false;
    }

    getDamage() {
        let damage = this.baseDamage + this.getLevelBonus('damage');
        return damage * this.owner.stats.damageMult;
    }

    getAttackSpeed() {
        let speed = this.baseAttackSpeed + this.getLevelBonus('attackSpeed');
        return speed * this.owner.stats.attackSpeedMult;
    }

    getProjectileSpeed() {
        return (this.baseProjectileSpeed + this.getLevelBonus('projectileSpeed'))
            * this.owner.stats.projectileSpeedMult;
    }

    getProjectileSize() {
        return (this.baseProjectileSize + this.getLevelBonus('projectileSize'))
            * this.owner.stats.projectileSizeMult;
    }

    getPiercing() {
        return this.basePiercing + this.getLevelBonus('piercing');
    }

    getProjectileCount() {
        return this.baseProjectileCount + this.getLevelBonus('projectileCount');
    }

    getLevelBonus(stat) {
        let bonus = 0;
        for (let i = 0; i < this.level - 1 && i < this.levelBonuses.length; i++) {
            if (this.levelBonuses[i][stat]) {
                bonus += this.levelBonuses[i][stat];
            }
        }
        return bonus;
    }

    update(deltaTime, enemies) {
        this.cooldown -= deltaTime;

        if (this.cooldown <= 0) {
            const target = this.findTarget(enemies);
            if (target || this.firesWithoutTarget) {
                const projectiles = this.fire(target, enemies);
                this.cooldown = 1 / this.getAttackSpeed();
                return projectiles;
            }
        }

        return null;
    }

    findTarget(enemies) {
        let nearest = null;
        let nearestDist = Infinity;

        for (const enemy of enemies) {
            if (!enemy.active) continue;
            const dist = this.owner.position.distanceTo(enemy.position);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        return nearest;
    }

    findMultipleTargets(enemies, count) {
        const activeEnemies = enemies.filter(e => e.active);
        activeEnemies.sort((a, b) => {
            return this.owner.position.distanceTo(a.position) -
                this.owner.position.distanceTo(b.position);
        });
        return activeEnemies.slice(0, count);
    }

    fire(target, enemies) {
        // Override in subclasses
        return null;
    }

    levelUp() {
        if (this.level < this.maxLevel) {
            this.level++;
            return true;
        }
        return false;
    }

    render(ctx, camera) {
        // Override in subclasses for weapon-specific visuals
    }
}
