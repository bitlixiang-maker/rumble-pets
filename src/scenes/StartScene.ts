// StartScene: shows a start placeholder then transitions to BattleScene.
// Scene switching is intentionally simple; no gameplay implemented here.

import Phaser from 'phaser'
import BattleScene from './BattleScene'

export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  create(): void {
    const { width, height } = this.scale
    this.add.text(width / 2, height / 2 - 20, 'Start Scene', { color: '#ffffff', fontSize: '32px' }).setOrigin(0.5)
    this.add.text(width / 2, height / 2 + 20, 'Preparing Battle...', { color: '#cccccc', fontSize: '16px' }).setOrigin(0.5)

    // Register BattleScene and transition after a short delay.
    // This implements the required Boot -> Start -> Battle flow.
    this.scene.add('BattleScene', BattleScene, false)

    this.time.delayedCall(600, () => {
      this.scene.start('BattleScene')
    })
  }
}
