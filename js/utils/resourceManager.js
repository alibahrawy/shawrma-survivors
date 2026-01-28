export class ResourceManager {
    constructor() {
        this.images = {};
        // Define paths relative to index.html
        this.assetManifest = {
            'player': 'assets/player.png',
            'zombie': 'assets/zombie.png',
            'skeleton': 'assets/skeleton.png',
            'bat': 'assets/bat.png',
            'golem': 'assets/golem.png',
            'gem_green': 'assets/gem_green.png',
            'gem_blue': 'assets/gem_blue.png',
            'gem_pink': 'assets/gem_pink.png',
            'magic_missile': 'assets/magic_missile.png',
            'floor_tile': 'assets/floor_tile.png'
        };
    }

    async loadAll() {
        const promises = Object.entries(this.assetManifest).map(([key, path]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.images[key] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load asset: ${path}`);
                    reject(`Failed to load asset: ${path}`);
                };
                img.src = path;
            });
        });

        await Promise.all(promises);
    }

    getImage(key) {
        return this.images[key];
    }
}

export const resources = new ResourceManager();
