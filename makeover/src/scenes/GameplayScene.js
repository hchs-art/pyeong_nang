import Phaser from 'phaser';

export class GameplayScene extends Phaser.Scene {
    constructor() {
        super('GameplayScene');
    }

    init(data) {
        this.target = data.target || 'car';
        this.tools = ['tool-scissors', 'tool-razor', 'tool-screwdriver', 'tool-chisel', 'tool-cream'];
        this.currentStage = 0; // 0 to 4
        this.currentTool = null;
        this.isCleaning = false;

        // Tracking cleanup
        this.gridSize = 25;
        this.cleanedCells = new Set();

        // Particles tracking to prevent overflow
        this.lastEraseTime = 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xe8f4f8, 0xe8f4f8, 0xb8dff0, 0xb8dff0, 1);
        bg.fillRect(0, 0, width, height);

        // Header Title
        this.add.text(width / 2, 50, 'SCRUB & CLEAN!', {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#2c8fbc',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 3, fill: true }
        }).setOrigin(0.5);

        // Calculate Image Scales
        const maxWidth = width * 0.7;
        const maxHeight = height * 0.6;

        const cleanTex = this.textures.get(`${this.target}-clean`).getSourceImage();
        const dirtyTex = this.textures.get(`${this.target}-dirty`).getSourceImage();

        // Scale based on the slightly larger dirty image bounds
        this.imgScale = Math.min(maxWidth / dirtyTex.width, maxHeight / dirtyTex.height);

        // Clean Image (Background) exactly centered
        this.cleanImg = this.add.image(width / 2, height / 2, `${this.target}-clean`);
        this.cleanImg.setScale(this.imgScale);

        // RT for Dirty Image exactly centered
        this.renderTexture = this.add.renderTexture(
            width / 2,
            height / 2,
            dirtyTex.width,
            dirtyTex.height
        ).setOrigin(0.5, 0.5).setScale(this.imgScale);

        // Draw the dirty image into the native center of the unscaled RT
        const dirtySprite = this.make.sprite({
            x: dirtyTex.width / 2,
            y: dirtyTex.height / 2,
            key: `${this.target}-dirty`,
            add: false
        });
        dirtySprite.setOrigin(0.5, 0.5);
        this.renderTexture.draw(dirtySprite, dirtySprite.x, dirtySprite.y);

        // Calculate total cells logically based on the unscaled dimension
        this.cols = Math.ceil(dirtyTex.width / this.gridSize);
        this.rows = Math.ceil(dirtyTex.height / this.gridSize);
        this.totalCells = this.cols * this.rows;

        // Particles
        this.particles = this.add.particles(0, 0, 'brush', {
            speed: { min: -50, max: 50 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.1, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 400,
            emitting: false
        });

        // Tool Sidebar
        this.createSidebar(width, height);

        // Status Container at bottom
        const statusBg = this.add.graphics();
        statusBg.fillStyle(0xffffff, 0.9);
        statusBg.fillRoundedRect(width / 2 - 200, height - 120, 400, 90, 20);
        statusBg.lineStyle(4, 0x2c8fbc, 1);
        statusBg.strokeRoundedRect(width / 2 - 200, height - 120, 400, 90, 20);

        this.statusText = this.add.text(width / 2, height - 90, 'Start by grabbing Tool 1!', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#333',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Progress Bar Background
        this.add.rectangle(width / 2, height - 55, 300, 20, 0xdddddd).setOrigin(0.5);
        // Progress Bar Fill
        this.progressBarFill = this.add.rectangle(width / 2 - 150, height - 55, 0, 20, 0x00ff00).setOrigin(0, 0.5);
        // Progress Text
        this.progressText = this.add.text(width / 2, height - 55, '0%', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Scaled up brush for erasing natively inside RT
        this.brush = this.make.image({ key: 'brush', add: false });
        this.brush.setOrigin(0.5, 0.5);

        // Interaction bindings
        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.on('pointermove', this.handlePointerMove, this);
        this.input.on('pointerup', this.handlePointerUp, this);
    }

    createSidebar(width, height) {
        // Container for tools on the right side
        // Shifted further right, and spacing reduced so it doesn't overlap center
        const startY = height / 2 - 200;
        this.toolButtons = [];

        this.tools.forEach((toolId, index) => {
            const yPos = startY + index * 100;

            // Container for tool
            const container = this.add.container(width - 45, yPos);

            const bg = this.add.graphics();
            // Smaller hit area
            container.setSize(60, 80);
            container.setInteractive({ cursor: 'pointer' });

            // Reduce scale of icons so they fit smaller boxes
            const icon = this.add.image(0, -10, toolId).setScale(0.5);

            // Add stage number text
            const textBg = this.add.graphics();
            textBg.fillStyle(0x000000, 0.7);
            textBg.fillRoundedRect(-25, 20, 50, 18, 9);

            const stageText = this.add.text(0, 29, `Stage ${index + 1}`, {
                fontFamily: 'Arial',
                fontSize: '11px', color: '#fff'
            }).setOrigin(0.5);

            container.add([bg, icon, textBg, stageText]);

            container.on('pointerdown', () => this.selectTool(index));
            container.on('pointerover', () => {
                this.tweens.add({ targets: container, scale: 1.1, duration: 100 });
            });
            container.on('pointerout', () => {
                this.tweens.add({ targets: container, scale: 1, duration: 100 });
            });

            this.toolButtons.push({ container, bg, icon, stageText, index, activeStateId: -1 });
        });

        this.highlightActiveTool();
    }

    setToolBoxColor(btn, colorBorder, colorFill, stateId) {
        if (btn.activeStateId === stateId) return;
        btn.bg.clear();
        btn.bg.fillStyle(colorFill, 1);
        btn.bg.fillRoundedRect(-30, -40, 60, 80, 12);
        btn.bg.lineStyle(3, colorBorder, 1);
        btn.bg.strokeRoundedRect(-30, -40, 60, 80, 12);
        btn.activeStateId = stateId;
    }

    selectTool(index) {
        if (index === this.currentStage) {
            this.currentTool = index;
            this.highlightActiveTool();
            this.updateStatus(`Using Stage ${index + 1} tool! Clean to ${(index + 1) * 20}%`);
        } else if (index < this.currentStage) {
            this.updateStatus(`Stage ${index + 1} is already complete!`);
        } else {
            this.updateStatus(`Wait! Complete Stage ${this.currentStage + 1} first.`);
            this.currentTool = null;
            this.highlightActiveTool();
        }
    }

    updateStatus(text) {
        this.statusText.setText(text);
        this.tweens.add({
            targets: this.statusText,
            scale: 1.1,
            yoyo: true,
            duration: 100
        });
    }

    highlightActiveTool() {
        this.toolButtons.forEach((btn, idx) => {
            if (idx === this.currentTool) {
                // Active and selected
                this.setToolBoxColor(btn, 0x00ff00, 0xe0ffe0, 1);
                btn.icon.setTint(0xffffff);
            } else if (idx === this.currentStage) {
                // Next to use
                this.setToolBoxColor(btn, 0xffaa00, 0xfff5e0, 2);
                btn.icon.setTint(0xffffff);
            } else if (idx < this.currentStage) {
                // Finished
                this.setToolBoxColor(btn, 0xaaaaaa, 0xdddddd, 3);
                btn.icon.setTint(0x888888); // Dimmed
            } else {
                // Locked
                this.setToolBoxColor(btn, 0xcccccc, 0xeeeeee, 4);
                btn.icon.setTint(0xaaaaaa);
            }
        });
    }

    handlePointerDown(pointer) {
        if (this.currentTool === null || this.currentStage >= 5) return;

        if (this.isPointerOverRT(pointer)) {
            this.isCleaning = true;
            this.eraseAtPointer(pointer);
        }
    }

    handlePointerMove(pointer) {
        if (!this.isCleaning || this.currentTool === null || this.currentStage >= 5) return;

        if (this.isPointerOverRT(pointer)) {
            this.eraseAtPointer(pointer);
        }
    }

    handlePointerUp() {
        this.isCleaning = false;
        this.checkProgress();
    }

    isPointerOverRT(pointer) {
        // Simple bounding box logic using world coords
        const leftEdgeWorld = this.renderTexture.x - (this.renderTexture.width * this.renderTexture.scaleX) / 2;
        const topEdgeWorld = this.renderTexture.y - (this.renderTexture.height * this.renderTexture.scaleY) / 2;

        const worldX = pointer.x - leftEdgeWorld;
        const worldY = pointer.y - topEdgeWorld;

        return worldX >= 0 && worldX <= (this.renderTexture.width * this.renderTexture.scaleX) &&
            worldY >= 0 && worldY <= (this.renderTexture.height * this.renderTexture.scaleY);
    }

    eraseAtPointer(pointer) {
        const leftEdgeWorld = this.renderTexture.x - (this.renderTexture.width * this.renderTexture.scaleX) / 2;
        const topEdgeWorld = this.renderTexture.y - (this.renderTexture.height * this.renderTexture.scaleY) / 2;

        const worldX = pointer.x - leftEdgeWorld;
        const worldY = pointer.y - topEdgeWorld;

        // Convert world to local RT coordinates
        const localX = worldX / this.renderTexture.scaleX;
        const localY = worldY / this.renderTexture.scaleY;

        // Erase using ERASE blend mode globally
        this.renderTexture.erase(this.brush, localX, localY);

        // Visual feedback
        if (this.time.now - this.lastEraseTime > 50) {
            this.particles.emitParticleAt(pointer.x, pointer.y, 1);
            this.lastEraseTime = this.time.now;
        }

        // Track cleaned percentage roughly on unscaled logic
        const gridX = Math.floor(localX / this.gridSize);
        const gridY = Math.floor(localY / this.gridSize);

        // Add current and surrounding cells (roughly a circle)
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                if (dx * dx + dy * dy <= 4) { // circle brush grid area approximation
                    const cx = gridX + dx;
                    const cy = gridY + dy;
                    if (cx >= 0 && cx < this.cols && cy >= 0 && cy < this.rows) {
                        this.cleanedCells.add(`${cx},${cy}`);
                    }
                }
            }
        }

        // Check progress constantly!
        this.checkProgress();
    }

    checkProgress() {
        if (this.currentStage >= 5) return;

        // Assume maximum cleanable area is around 55% of total mathematical cells
        const effectiveTotal = this.totalCells * 0.55;
        const cleanPercentage = Math.min((this.cleanedCells.size / effectiveTotal) * 100, 100);

        // Update Progress Bar
        this.progressBarFill.width = 300 * (cleanPercentage / 100);
        this.progressText.setText(`${Math.floor(cleanPercentage)}%`);

        // Target percentage for current stage
        const targetPerc = (this.currentStage + 1) * 20;

        if (cleanPercentage >= targetPerc) {
            // Give a little visual punch
            this.cameras.main.flash(200, 255, 255, 255);

            this.updateStatus(`Stage ${this.currentStage + 1} Complete!`);
            this.currentStage++;
            this.currentTool = null; // force re-selection
            this.isCleaning = false;

            this.highlightActiveTool();

            if (this.currentStage >= 5) {
                // Ensure text goes to 100%
                this.progressBarFill.width = 300;
                this.progressText.setText('100%');
                this.triggerWin();
            } else {
                setTimeout(() => {
                    if (this.currentStage < 5) {
                        this.updateStatus(`Grab Tool ${this.currentStage + 1} to continue!`);
                    }
                }, 1500);
            }
        }
    }

    triggerWin() {
        this.updateStatus('Fully Cleaned! Great Job!');
        // Destroy RT
        this.renderTexture.destroy();
        this.particles.destroy();

        // Dim background
        this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);

        // Create a glow behind the center image
        const glowWrapper = this.add.graphics();
        glowWrapper.fillGradientStyle(0xffffff, 0xffffff, 0x000000, 0x000000, 0.5);
        glowWrapper.fillCircle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 300);

        // Show clean app center above dim
        const finalImg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, `${this.target}-clean`).setScale(this.imgScale);
        finalImg.setDepth(10);

        // Pop animation
        this.tweens.add({
            targets: finalImg,
            scaleX: this.imgScale * 1.15,
            scaleY: this.imgScale * 1.15,
            yoyo: true,
            duration: 400,
            ease: 'Back.easeOut'
        });

        // Confetti effect placeholder
        for (let i = 0; i < 30; i++) {
            const conf = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 10, 10, Phaser.Math.Between(0x000000, 0xffffff));
            conf.setDepth(11);
            this.tweens.add({
                targets: conf,
                x: this.cameras.main.width / 2 + Phaser.Math.Between(-300, 300),
                y: this.cameras.main.height + 100,
                angle: Phaser.Math.Between(0, 360),
                duration: Phaser.Math.Between(1500, 2500),
                ease: 'Sine.easeIn'
            });
        }

        // CTA Button
        const ctaBg = this.add.graphics();
        ctaBg.fillStyle(0x00c853, 1);
        ctaBg.fillRoundedRect(this.cameras.main.width / 2 - 150, this.cameras.main.height / 2 + 200, 300, 80, 40);
        ctaBg.lineStyle(6, 0xffffff, 1);
        ctaBg.strokeRoundedRect(this.cameras.main.width / 2 - 150, this.cameras.main.height / 2 + 200, 300, 80, 40);

        const ctaZone = this.add.zone(this.cameras.main.width / 2, this.cameras.main.height / 2 + 240, 300, 80).setInteractive({ cursor: 'pointer' });
        ctaZone.setDepth(15);

        const ctaText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 240, 'DOWNLOAD NOW!', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#ffffff',
            shadow: { offsetX: 2, offsetY: 2, color: '#005500', blur: 2, fill: true }
        }).setOrigin(0.5).setDepth(15);

        ctaZone.on('pointerdown', () => {
            window.location.replace('https://example.com/download-makeover');
        });

        // Pulsate CTA
        this.tweens.add({
            targets: [ctaText],
            scaleX: 1.05,
            scaleY: 1.05,
            yoyo: true,
            repeat: -1,
            duration: 600
        });
    }
}
