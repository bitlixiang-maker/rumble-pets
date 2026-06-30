import Phaser from 'phaser'
import { FONT_SIZES, COLORS } from './UIConstants'

export default class BattleLogPanel extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics
  private text: Phaser.GameObjects.Text
  private rect: Phaser.Geom.Rectangle

  constructor(scene: Phaser.Scene, rect: Phaser.Geom.Rectangle) {
    super(scene, 0, 0)
    this.rect = rect
    this.bg = scene.add.graphics()
    this.text = scene.add.text(12, 12, '', { fontSize: `${FONT_SIZES.small}px`, color: COLORS.text })
    this.add([this.bg, this.text])
    this.draw()
  }

  private draw(): void {
    this.bg.clear()
    this.bg.fillStyle(0x2b2b2b, 1)
    this.bg.fillRoundedRect(0, 0, this.rect.width, this.rect.height, 8)
    this.bg.lineStyle(2, 0x666666, 1)
    this.bg.strokeRoundedRect(0, 0, this.rect.width, this.rect.height, 8)
  }

  // Accepts an array of strings. Newest message should be at the bottom.
  // Keeps messages limited to latest 8 entries.
  refresh(data: string[]): void {
    const logs = data ?? []
    const recent = logs.slice(-8)
    this.text.setText(recent.join('\n'))
    // align text at bottom by adjusting y
    this.text.setY(this.rect.height - this.text.height - 12)
  }
}
