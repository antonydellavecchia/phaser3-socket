import Phaser from 'phaser';
import MainScene  from './scenes/MainScene';
import Controller  from './scenes/Controller';
import VirtualJoyStickPlugin from './plugins/virtualjoystick-plugin.min.js';

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  plugins: {
    global: [{
      key: 'rexVirtualJoyStick',
      plugin: VirtualJoyStickPlugin,
      start: true
    }]
  },
  scene: MainScene
};

const game = new Phaser.Game(config);

