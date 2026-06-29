// AssetManager: placeholder for centralized asset loading.
// Responsibilities in future:
// - preload images, spritesheets, audio
// - provide cached references

export default class AssetManager {
  private constructor() {}

  static async load(scene: Phaser.Scene): Promise<void> {
    // TODO: use scene.load to queue assets and return when complete
    return Promise.resolve()
  }
}
