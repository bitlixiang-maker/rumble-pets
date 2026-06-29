// BattleScene: placeholder UI only. No gameplay here.
// Displays a simple message to indicate the scene is under construction.

import Phaser from 'phaser'

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
  }

  create(): void {
    const { width, height } = this.scale
    this.add.text(width / 2, height / 2 - 20, 'Battle Scene', { color: '#ffffff', fontSize: '40px' }).setOrigin(0.5)
    this.add.text(width / 2, height / 2 + 30, 'Under Construction', { color: '#ffcc00', fontSize: '20px' }).setOrigin(0.5)
  }
}
