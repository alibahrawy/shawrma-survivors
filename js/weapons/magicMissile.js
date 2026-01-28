import { Weapon } from './weapon.js';
import { Projectile } from '../entities/projectile.js';
import { sound } from '../systems/soundSystem.js';

export class MagicMissile extends Weapon {
    constructor(owner) {
        super(owner, {
            id: 'magic_missile',
            name: 'Magic Missile',
            icon: '✨',
            color: '#FFEB3B',
            baseDamage: 10,
            baseAttackSpeed: 1,
            baseProjectileSpeed: 450,
            baseProjectileSize: 7,
            basePiercing: 0,
            baseProjectileCount: 1,
            levelBonuses: [
                { damage: 5 },                          // Level 2
                { projectileCount: 1 },                 // Level 3
                { attackSpeed: 0.3 },                   // Level 4
                { piercing: 1 },                        // Level 5
                { projectileCount: 1 },                 // Level 6
                { damage: 10 },                         // Level 7
                { projectileCount: 1, piercing: 1 }     // Level 8
            ]
        });
    }

    fire(target, enemies) {
        const projectiles = [];
        const count = this.getProjectileCount();
        const targets = this.findMultipleTargets(enemies, count);

        for (let i = 0; i < count; i++) {
            const currentTarget = targets[i % targets.length];
            if (!currentTarget) continue;

            const projectile = new Projectile(
                this.owner.position.x,
                this.owner.position.y,
                {
                    targetPosition: currentTarget.position,
                    damage: this.getDamage(),
                    speed: this.getProjectileSpeed(),
                    radius: this.getProjectileSize(),
                    piercing: this.getPiercing(),
                    color: this.color,
                    weaponId: this.id
                }
            );
            projectiles.push(projectile);
        }

        if (projectiles.length > 0) {
            sound.playShoot();
        }

        return projectiles.length > 0 ? projectiles : null;
    }
}
