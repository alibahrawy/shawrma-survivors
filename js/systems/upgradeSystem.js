import { UPGRADES, UPGRADE_TYPES } from '../data/upgrades.js';
import { MagicMissile } from '../weapons/magicMissile.js';
import { AuraField } from '../weapons/auraField.js';
import { SpinningOrb } from '../weapons/spinningOrb.js';

export class UpgradeSystem {
    constructor(game) {
        this.game = game;

        // Track upgrade stacks
        this.upgradeStacks = {};
        for (const id of Object.keys(UPGRADES)) {
            this.upgradeStacks[id] = 0;
        }

        // Current upgrade choices
        this.currentChoices = [];
    }

    generateChoices(count = 3) {
        const player = this.game.player;
        const available = this.getAvailableUpgrades();

        // Shuffle and pick
        const shuffled = available.sort(() => Math.random() - 0.5);
        this.currentChoices = shuffled.slice(0, count);

        return this.currentChoices.map(upgrade => this.formatUpgradeForDisplay(upgrade));
    }

    getAvailableUpgrades() {
        const player = this.game.player;
        const available = [];

        for (const [id, upgrade] of Object.entries(UPGRADES)) {
            if (upgrade.isWeapon) {
                // Check if weapon is owned
                const weapon = player.weapons.find(w => w.id === upgrade.weaponId);

                if (weapon) {
                    // Weapon upgrade (if not max level)
                    if (weapon.level < weapon.maxLevel) {
                        available.push({ ...upgrade, isUpgrade: true, currentLevel: weapon.level });
                    }
                } else {
                    // New weapon unlock
                    available.push({ ...upgrade, isUpgrade: false });
                }
            } else {
                // Stat upgrade (if not max stacks)
                if (this.upgradeStacks[id] < upgrade.maxStacks) {
                    available.push({
                        ...upgrade,
                        currentStacks: this.upgradeStacks[id]
                    });
                }
            }
        }

        return available;
    }

    formatUpgradeForDisplay(upgrade) {
        let description = upgrade.description;
        let name = upgrade.name;

        if (upgrade.isWeapon) {
            if (upgrade.isUpgrade) {
                description = `${upgrade.descriptionUpgrade} (Lv ${upgrade.currentLevel} → ${upgrade.currentLevel + 1})`;
            }
        } else {
            const stacks = this.upgradeStacks[upgrade.id];
            if (stacks > 0) {
                name = `${upgrade.name} (${stacks + 1}/${upgrade.maxStacks})`;
            }
        }

        return {
            id: upgrade.id,
            name: name,
            description: description,
            icon: upgrade.icon,
            color: upgrade.color,
            isWeapon: upgrade.isWeapon
        };
    }

    applyUpgrade(index) {
        if (index < 0 || index >= this.currentChoices.length) return false;

        const upgrade = this.currentChoices[index];
        const player = this.game.player;

        if (upgrade.isWeapon) {
            const weapon = player.weapons.find(w => w.id === upgrade.weaponId);

            if (weapon) {
                // Level up existing weapon
                weapon.levelUp();
            } else {
                // Add new weapon
                const newWeapon = this.createWeapon(upgrade.weaponId, player);
                if (newWeapon) {
                    player.weapons.push(newWeapon);
                }
            }
        } else {
            // Apply stat upgrade
            upgrade.apply(player);
            this.upgradeStacks[upgrade.id]++;
        }

        this.currentChoices = [];
        return true;
    }

    createWeapon(weaponId, owner) {
        switch (weaponId) {
            case 'magic_missile':
                return new MagicMissile(owner);
            case 'aura_field':
                return new AuraField(owner);
            case 'spinning_orb':
                return new SpinningOrb(owner);
            default:
                return null;
        }
    }

    reset() {
        for (const id of Object.keys(this.upgradeStacks)) {
            this.upgradeStacks[id] = 0;
        }
        this.currentChoices = [];
    }
}
