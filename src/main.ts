import Phaser from 'phaser'
import BootScene from './scenes/BootScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0b0b0b',
  parent: 'app',
  scene: [BootScene]
}

// Entry point: create the Phaser game instance and start with BootScene.
new Phaser.Game(config)
