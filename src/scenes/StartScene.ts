import Phaser from 'phaser'

// StartScene is the main menu / entry point for the player.
// Keep UI here simple: a title and a start button that switches to BattleScene.
export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' })
  }

  create() {
    const { width, height } = this.scale

    const title = this.add.text(width / 2, height / 2 - 150, 'Rumble Pets', {
      fontFamily: 'Arial',
      fontSize: '72px',
      color: '#ffffff'
    }).setOrigin(0.5)

    const subtitle = this.add.text(width / 2, height / 2 - 80, 'Playable Prototype', {
      fontSize: '28px',
      color: '#cccccc'
    }).setOrigin(0.5)

    const startBtn = this.add.rectangle(width / 2, height / 2 + 40, 420, 90, 0x00aa00).setInteractive({ useHandCursor: true })
    const startText = this.add.text(startBtn.x, startBtn.y, 'Start Battle', { fontSize: '36px', color: '#ffffff' }).setOrigin(0.5)

    startBtn.on('pointerdown', () => {
      // Navigate to BattleScene. Scene switching should be simple and explicit.
      this.scene.start('BattleScene')
    })
  }
}
