// Upgrade type identifiers
export const UPGRADE_TYPES = {
    // Stat upgrades
    STAT_MAX_HEALTH: 'stat_max_health',
    STAT_SPEED: 'stat_speed',
    STAT_DAMAGE: 'stat_damage',
    STAT_ATTACK_SPEED: 'stat_attack_speed',
    STAT_ARMOR: 'stat_armor',
    STAT_PICKUP_RADIUS: 'stat_pickup_radius',
    STAT_REGEN: 'stat_regen',
    STAT_XP_GAIN: 'stat_xp_gain',

    // Weapon unlocks/upgrades
    WEAPON_MAGIC_MISSILE: 'weapon_magic_missile',
    WEAPON_AURA_FIELD: 'weapon_aura_field',
    WEAPON_SPINNING_ORB: 'weapon_spinning_orb'
};

// All upgrade definitions
export const UPGRADES = {
    [UPGRADE_TYPES.STAT_MAX_HEALTH]: {
        id: UPGRADE_TYPES.STAT_MAX_HEALTH,
        name: 'Vitality',
        description: '+20% Max Health',
        icon: '❤️',
        color: '#F44336',
        maxStacks: 5,
        currentStacks: 0,
        apply: (player) => {
            player.stats.maxHealthMult += 0.2;
            player.health = Math.min(player.health + 20, player.getEffectiveMaxHealth());
        }
    },

    [UPGRADE_TYPES.STAT_SPEED]: {
        id: UPGRADE_TYPES.STAT_SPEED,
        name: 'Swiftness',
        description: '+15% Move Speed',
        icon: '👟',
        color: '#2196F3',
        maxStacks: 5,
        currentStacks: 0,
        apply: (player) => {
            player.stats.speedMult += 0.15;
        }
    },

    [UPGRADE_TYPES.STAT_DAMAGE]: {
        id: UPGRADE_TYPES.STAT_DAMAGE,
        name: 'Power',
        description: '+20% Damage',
        icon: '⚔️',
        color: '#FF5722',
        maxStacks: 5,
        currentStacks: 0,
        apply: (player) => {
            player.stats.damageMult += 0.2;
        }
    },

    [UPGRADE_TYPES.STAT_ATTACK_SPEED]: {
        id: UPGRADE_TYPES.STAT_ATTACK_SPEED,
        name: 'Haste',
        description: '+15% Attack Speed',
        icon: '⚡',
        color: '#FFEB3B',
        maxStacks: 5,
        currentStacks: 0,
        apply: (player) => {
            player.stats.attackSpeedMult += 0.15;
        }
    },

    [UPGRADE_TYPES.STAT_ARMOR]: {
        id: UPGRADE_TYPES.STAT_ARMOR,
        name: 'Toughness',
        description: '+3 Armor',
        icon: '🛡️',
        color: '#607D8B',
        maxStacks: 5,
        currentStacks: 0,
        apply: (player) => {
            player.stats.armorFlat += 3;
        }
    },

    [UPGRADE_TYPES.STAT_PICKUP_RADIUS]: {
        id: UPGRADE_TYPES.STAT_PICKUP_RADIUS,
        name: 'Magnetism',
        description: '+30% Pickup Range',
        icon: '🧲',
        color: '#9C27B0',
        maxStacks: 3,
        currentStacks: 0,
        apply: (player) => {
            player.stats.pickupRadiusMult += 0.3;
        }
    },

    [UPGRADE_TYPES.STAT_REGEN]: {
        id: UPGRADE_TYPES.STAT_REGEN,
        name: 'Regeneration',
        description: '+1 HP/second',
        icon: '💚',
        color: '#4CAF50',
        maxStacks: 5,
        currentStacks: 0,
        apply: (player) => {
            player.stats.regenPerSecond += 1;
        }
    },

    [UPGRADE_TYPES.STAT_XP_GAIN]: {
        id: UPGRADE_TYPES.STAT_XP_GAIN,
        name: 'Wisdom',
        description: '+20% XP Gain',
        icon: '📚',
        color: '#673AB7',
        maxStacks: 3,
        currentStacks: 0,
        apply: (player) => {
            player.stats.xpGainMult += 0.2;
        }
    },

    [UPGRADE_TYPES.WEAPON_MAGIC_MISSILE]: {
        id: UPGRADE_TYPES.WEAPON_MAGIC_MISSILE,
        name: 'Magic Missile',
        description: 'Auto-targeting projectile',
        descriptionUpgrade: 'Level up Magic Missile',
        icon: '✨',
        color: '#FFEB3B',
        isWeapon: true,
        weaponId: 'magic_missile',
        maxLevel: 8
    },

    [UPGRADE_TYPES.WEAPON_AURA_FIELD]: {
        id: UPGRADE_TYPES.WEAPON_AURA_FIELD,
        name: 'Aura Field',
        description: 'Damage nearby enemies',
        descriptionUpgrade: 'Level up Aura Field',
        icon: '🔵',
        color: '#00BCD4',
        isWeapon: true,
        weaponId: 'aura_field',
        maxLevel: 8
    },

    [UPGRADE_TYPES.WEAPON_SPINNING_ORB]: {
        id: UPGRADE_TYPES.WEAPON_SPINNING_ORB,
        name: 'Spinning Orb',
        description: 'Orbiting projectiles',
        descriptionUpgrade: 'Level up Spinning Orb',
        icon: '🔴',
        color: '#FF5722',
        isWeapon: true,
        weaponId: 'spinning_orb',
        maxLevel: 8
    }
};
