import Phaser from 'phaser'
import { PANEL_SIZES, MARGIN, RADIUS, COLORS, FONT_SIZES } from './UIConstants'

export default class PlayerPanel extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics
  private hpBg: Phaser.GameObjects.Graphics
  private hpFill: Phaser.GameObjects.Graphics
  private hpText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    super(scene, x, y)
    this.gfx = scene.add.graphics()
    this.hpBg = scene.add.graphics()
    this.hpFill = scene.add.graphics()
    this.hpText = scene.add.text(0, 0, 'HP', { fontSize: `${FONT_SIZES.normal}px`, color: COLORS.text })

    this.add([this.gfx, this.hpBg, this.hpFill, this.hpText])
    this.refresh()
  }

  refresh(data?: { hpPercent?: number }): void {
    const scene = this.scene
    const width = scene.scale.width
    const height = PANEL_SIZES.playerPanelHeight

    this.gfx.clear()
    this.gfx.fillStyle(COLORS.panelBg, 1)
    this.gfx.fillRoundedRect(0, 0, width, height, RADIUS)

    const barX = MARGIN
    const barY = height / 2 - 16
    const barW = Math.min(800, width - 2 * MARGIN)
    const barH = 32

    const hpPercent = data?.hpPercent ?? 1

    this.hpBg.clear()
    this.hpBg.fillStyle(0x333333, 1)
    this.hpBg.fillRoundedRect(barX, barY, barW, barH, 8)

    this.hpFill.clear()
    this.hpFill.fillStyle(0x44cc44, 1)
    this.hpFill.fillRoundedRect(barX, barY, barW * hpPercent, barH, 8)

    this.hpText.setText(`HP`)
    this.hpText.setX(barX + barW + 12)
    this.hpText.setY(barY + barH / 2 - this.hpText.height / 2)
  }
}
