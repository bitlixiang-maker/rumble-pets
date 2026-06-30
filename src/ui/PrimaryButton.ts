import Phaser from 'phaser'
import { FONT_SIZES, COLORS } from './UIConstants'

export default class PrimaryButton extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics
  private label: Phaser.GameObjects.Text
  private rect: Phaser.Geom.Rectangle
  private hit: Phaser.GameObjects.Rectangle
  private _disabled = false

  constructor(scene: Phaser.Scene, rect: Phaser.Geom.Rectangle, text: string) {
    super(scene, 0, 0)
    this.rect = rect
    this.bg = scene.add.graphics()
    this.label = scene.add.text(0, 0, text, { fontSize: `${FONT_SIZES.normal}px`, color: COLORS.text }).setOrigin(0.5)
    this.hit = scene.add.rectangle(0, 0, rect.width, rect.height, 0x000000, 0).setOrigin(0.5)

    this.add([this.bg, this.label, this.hit])
    this.draw()

    // Make the hit area interactive and forward event from container
    this.hit.setInteractive()
    this.hit.on('pointerdown', () => {
      if (!this._disabled) {
        // emit a custom event that BattleScene can listen to
        this.emit('pressed')
      }
    })
  }

  private draw(): void {
    this.bg.clear()
    const w = this.rect.width
    const h = this.rect.height
    this.bg.fillStyle(0xff8c00, 1)
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12)
    this.bg.lineStyle(2, 0x666666, 1)
    this.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12)
  }

  // data: { label?: string; disabled?: boolean }
  refresh(data: { label?: string; disabled?: boolean }): void {
    if (data.label !== undefined) this.label.setText(data.label)
    if (data.disabled !== undefined) {
      this._disabled = Boolean(data.disabled)
      this.hit.input.enabled = !this._disabled
      this.alpha = this._disabled ? 0.6 : 1
    }
  }
}
