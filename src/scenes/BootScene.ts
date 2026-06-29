// BootScene: minimal boot that immediately transitions to StartScene.
// Responsibilities:
// - perform initial setup (ConfigManager/AssetManager initialization in future)
// - switch to StartScene

import Phaser from 'phaser'
import StartScene from './StartScene'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  create(): void {
    // Placeholder for boot-time initialization (configs, assets).
    // In future: await ConfigManager.initialize(); await AssetManager.load();

    // Immediately proceed to StartScene. This keeps BootScene simple.
    this.scene.add('StartScene', StartScene, false)
    this.scene.start('StartScene')
  }
}
