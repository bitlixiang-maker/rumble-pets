import Phaser from 'phaser'
import { FONT_SIZES, COLORS, MARGIN, PANEL_SIZES, RADIUS } from './UIConstants'

export default class TopHUD extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics
  private titleText: Phaser.GameObjects.Text
  private coinText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    super(scene, x, y)
    this.gfx = scene.add.graphics()
    this.titleText = scene.add.text(MARGIN, 0, 'Level 1: Training Grounds', { fontSize: `${FONT_SIZES.title}px`, color: COLORS.text })
    this.coinText = scene.add.text(width - MARGIN, 0, 'Coin: 0', { fontSize: `${FONT_SIZES.normal}px`, color: '#ffd24d' }).setOrigin(1, 0)

    this.add([this.gfx, this.titleText, this.coinText])

    this.refresh()
  }

  // Refresh redraws layout using current scene width/height and accepts
  // optional data for display. No gameplay logic here.
  refresh(data?: { levelTitle?: string; coin?: number }): void {
    const scene = this.scene
    const width = scene.scale.width
    const height = PANEL_SIZES.topHudHeight

    // draw rounded background
    this.gfx.clear()
    this.gfx.fillStyle(COLORS.panelBg, 1)
    this.gfx.fillRoundedRect(0, 0, width, height, RADIUS)

    // update texts
    this.titleText.setText(data?.levelTitle ?? 'Level 1: Training Grounds')
    this.titleText.setY(height / 2 - this.titleText.height / 2)

    this.coinText.setText(`Coin: ${data?.coin ?? 100}`)
    this.coinText.setY(height / 2 - this.coinText.height / 2)
  }
}
