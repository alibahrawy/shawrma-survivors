// Enemy type configurations
export const ENEMY_TYPES = {
    zombie: {
        type: 'zombie',
        radius: 14,
        color: '#8BC34A', // Sickly green
        maxHealth: 15,
        speed: 60,
        damage: 10,
        xpValue: 1,
        behaviorType: 'chase',
        spawnWeight: 45
    },

    bat: {
        type: 'bat',
        radius: 10,
        color: '#9C27B0', // Purple
        maxHealth: 5,
        speed: 140,
        damage: 5,
        xpValue: 1,
        behaviorType: 'erratic',
        spawnWeight: 30
    },

    skeleton: {
        type: 'skeleton',
        radius: 12,
        color: '#ECEFF1', // Bone white
        maxHealth: 20,
        speed: 70,
        damage: 15,
        xpValue: 2,
        behaviorType: 'charger',
        chargeSpeed: 280,
        preferredDistance: 150,
        spawnWeight: 18
    },

    golem: {
        type: 'golem',
        radius: 26,
        color: '#795548', // Brown
        maxHealth: 80,
        speed: 35,
        damage: 25,
        xpValue: 5,
        behaviorType: 'tank',
        spawnWeight: 7
    }
};

// Get a weighted random enemy type
export function getRandomEnemyType(allowedTypes = null) {
    const types = allowedTypes || Object.keys(ENEMY_TYPES);
    let totalWeight = 0;

    for (const type of types) {
        totalWeight += ENEMY_TYPES[type].spawnWeight;
    }

    let random = Math.random() * totalWeight;

    for (const type of types) {
        random -= ENEMY_TYPES[type].spawnWeight;
        if (random <= 0) {
            return { ...ENEMY_TYPES[type] };
        }
    }

    return { ...ENEMY_TYPES[types[0]] };
}
