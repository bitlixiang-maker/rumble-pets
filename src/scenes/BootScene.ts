import Phaser from 'phaser'
import ConfigManager from '../core/ConfigManager'
import AssetManager from '../core/AssetManager'

// BootScene is responsible for loading minimal configuration and assets,
// then handing off to StartScene. Keep this minimal — game initialization
// (systems, plugin registration, more assets) should happen later.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Load JSON config for the prototype. In a real project this may be
    // versioned or fetched from a backend.
    this.load.json('gameConfig', '/src/config/game.json')

    // Generic asset loader — currently empty to avoid 404s. Add assets in
    // src/core/AssetManager.ts and they'll be loaded here.
    AssetManager.loadAll(this)

    const loading = this.add.text(960, 540, 'Loading...', { fontSize: '28px', color: '#ffffff' }).setOrigin(0.5)
    this.load.on('progress', (p: number) => loading.setText(`Loading... ${Math.round(p * 100)}%`))
    this.load.on('complete', () => loading.destroy())
  }

  create() {
    const cfg = this.cache.json.get('gameConfig')
    if (cfg) ConfigManager.initialize(cfg)

    // Start the StartScene. BootScene should be lightweight and only run once.
    this.scene.start('StartScene')
  }
}
