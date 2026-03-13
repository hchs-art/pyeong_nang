import Phaser from 'phaser';

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            this.scene.start('SelectionScene');
        });

        // Load Models
        this.load.image('car-clean', 'model/car-clean.png');
        this.load.image('car-dirty', 'model/car-dirty.png');
        this.load.image('tank-clean', 'model/tank-clean.png');
        this.load.image('tank-dirty', 'model/tank-dirty.png');
        this.load.image('airplane-clean', 'model/airplane-clean.png');
        this.load.image('airplane-dirty', 'model/airplane-dirty.png');

        // Load Tool Icons
        this.load.image('tool-chisel', 'tools/chisel-icon.png');
        this.load.image('tool-cream', 'tools/cream-icon.png');
        this.load.image('tool-razor', 'tools/razor-icon.png');
        this.load.image('tool-scissors', 'tools/scissors-icon.png');
        this.load.image('tool-screwdriver', 'tools/screwdriver-icon.png');

        // Load brush for masking
        // We'll generate a brush graphics dynamically if needed, 
        // but creating a soft brush image helps.
    }

    create() {
        // Create a large soft brush texture for erasing
        const brushGraphics = this.make.graphics();
        brushGraphics.fillStyle(0xffffff, 1);
        brushGraphics.fillCircle(100, 100, 100);
        brushGraphics.generateTexture('brush', 200, 200);
    }
}
