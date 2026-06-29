import Phaser from 'phaser'

// AssetManager: curated list of assets and a single loadAll(scene) entry
// point. Keep it small and explicit; add new assets here as the project
// grows. For now we avoid loading non-existent files so the dev server
// doesn't return 404s during development.

export default class AssetManager {
  // TODO: populate lists with real assets and implement preloading groups
  static loadAll(scene: Phaser.Scene) {
    // Example (commented):
    // scene.load.image('player', '/assets/images/player.png')

    // No-op for now to keep the loader quiet.
  }
}
