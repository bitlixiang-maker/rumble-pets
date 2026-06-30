import Phaser from 'phaser'
import { PANEL_SIZES, RADIUS, COLORS, FONT_SIZES } from './UIConstants'

export default class PrimaryButton extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics
  private label: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y)
    this.gfx = scene.add.graphics()
    this.label = scene.add.text(0, 0, text, { fontSize: `${FONT_SIZES.normal}px`, color: COLORS.text }).setOrigin(0.5)

    this.add([this.gfx, this.label])
    this.refresh()
  }

  refresh(): void {
    const w = PANEL_SIZES.buttonWidth
    const h = PANEL_SIZES.buttonHeight

    this.gfx.clear()
    this.gfx.fillStyle(COLORS.accent, 1)
    this.gfx.fillRoundedRect(-w / 2, -h / 2, w, h, RADIUS)
  }
}
