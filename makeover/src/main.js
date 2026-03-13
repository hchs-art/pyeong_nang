import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader.js';
import { SelectionScene } from './scenes/SelectionScene.js';
import { GameplayScene } from './scenes/GameplayScene.js';

const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 1000,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Preloader,
        SelectionScene,
        GameplayScene
    ]
};

new Phaser.Game(config);
