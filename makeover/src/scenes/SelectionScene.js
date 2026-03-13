import Phaser from 'phaser';

export class SelectionScene extends Phaser.Scene {
    constructor() {
        super('SelectionScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Gradient background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x7ac1f2, 0x7ac1f2, 0x1f5d99, 0x1f5d99, 1);
        bg.fillRect(0, 0, width, height);

        this.add.text(width / 2, 80, 'MAKEOVER MASTER', {
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, fill: true }
        }).setOrigin(0.5);

        this.add.text(width / 2, 140, 'Select an item to clean!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const options = ['car', 'tank', 'airplane'];

        options.forEach((target, index) => {
            const yPos = 280 + (index * 220);

            // Background shadow
            const shadow = this.add.graphics();
            shadow.fillStyle(0x000000, 0.4);
            shadow.fillRoundedRect(width / 2 - 195, yPos - 85, 400, 180, 20);

            // Card bg
            const cardBg = this.add.graphics();
            cardBg.fillStyle(0xffffff, 1);
            cardBg.fillRoundedRect(width / 2 - 200, yPos - 90, 400, 180, 20);

            // Hit box
            const hitArea = this.add.zone(width / 2, yPos, 400, 180).setInteractive({ cursor: 'pointer' });

            // Image
            const img = this.add.image(width / 2 - 80, yPos, `${target}-dirty`);
            const scale = 140 / Math.max(img.width, img.height);
            img.setScale(scale);

            // Name
            const title = this.add.text(width / 2 + 60, yPos, target.toUpperCase(), {
                fontFamily: 'Arial Black, sans-serif',
                fontSize: '36px',
                color: '#333333'
            }).setOrigin(0.5);

            // Interactions
            hitArea.on('pointerover', () => {
                this.tweens.add({ targets: [img, title], scale: scale * 1.1, duration: 150 });
                cardBg.clear();
                cardBg.fillStyle(0xf0fff0, 1);
                cardBg.lineStyle(4, 0x00ff00, 1);
                cardBg.strokeRoundedRect(width / 2 - 200, yPos - 90, 400, 180, 20);
                cardBg.fillRoundedRect(width / 2 - 200, yPos - 90, 400, 180, 20);
            });
            hitArea.on('pointerout', () => {
                this.tweens.add({ targets: [img], scale: scale, duration: 150 });
                this.tweens.add({ targets: [title], scale: 1, duration: 150 });
                cardBg.clear();
                cardBg.fillStyle(0xffffff, 1);
                cardBg.fillRoundedRect(width / 2 - 200, yPos - 90, 400, 180, 20);
            });
            hitArea.on('pointerdown', () => {
                this.scene.start('GameplayScene', { target: target });
            });
        });
    }
}
