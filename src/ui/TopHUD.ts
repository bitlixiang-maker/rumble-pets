import Phaser from 'phaser'
import { FONT_SIZES, COLORS } from './UIConstants'

export default class TopHUD extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics
  private coinText: Phaser.GameObjects.Text
  private waveText: Phaser.GameObjects.Text
  private timerText: Phaser.GameObjects.Text
  private rect: Phaser.Geom.Rectangle

  constructor(scene: Phaser.Scene, rect: Phaser.Geom.Rectangle) {
    super(scene, 0, 0)
    this.rect = rect
    this.bg = scene.add.graphics()
    this.coinText = scene.add.text(12, 12, '', { fontSize: `${FONT_SIZES.normal}px`, color: COLORS.text })
    this.waveText = scene.add.text(12, 36, '', { fontSize: `${FONT_SIZES.small}px`, color: COLORS.text })
    this.timerText = scene.add.text(rect.width - 12, 12, '', { fontSize: `${FONT_SIZES.normal}px`, color: COLORS.text }).setOrigin(1, 0)

    this.add([this.bg, this.coinText, this.waveText, this.timerText])

    this.draw()
  }

  private draw(): void {
    this.bg.clear()
    this.bg.fillStyle(0x2b2b2b, 1)
    this.bg.fillRoundedRect(0, 0, this.rect.width, this.rect.height, 8)
    this.bg.lineStyle(2, 0x666666, 1)
    this.bg.strokeRoundedRect(0, 0, this.rect.width, this.rect.height, 8)
  }

  refresh(data: { coin?: number; wave?: string; timer?: string }): void {
    this.coinText.setText(`Coin: ${data.coin ?? 0}`)
    this.waveText.setText(`Wave: ${data.wave ?? '0/0'}`)
    this.timerText.setText(`Timer: ${data.timer ?? '00:00'}`)
  }
}
