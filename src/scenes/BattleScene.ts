import Phaser from 'phaser'

// BattleScene is intentionally minimal for now. It only displays a
// placeholder message so the project compiles and the scene graph is
// exercised. Gameplay and systems will be added later.
export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
  }

  create() {
    const { width, height } = this.scale

    // Simple placeholder text
    this.add.text(width / 2, height / 2 - 20, 'Battle Scene', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5)
    this.add.text(width / 2, height / 2 + 40, 'Under Construction', { fontSize: '24px', color: '#cccccc' }).setOrigin(0.5)
  }
}
