import Phaser from 'phaser'
import { PANEL_SIZES, RADIUS, COLORS, FONT_SIZES, EGG_SLOT, MARGIN } from './UIConstants'

export default class EggPanel extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics
  private slotLabels: Phaser.GameObjects.Text[] = []

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    super(scene, x, y)
    this.gfx = scene.add.graphics()
    this.add(this.gfx)

    for (let i = 0; i < 10; i++) {
      const t = scene.add.text(0, 0, `Egg ${i + 1}`, { fontSize: `${FONT_SIZES.small}px`, color: COLORS.text })
      this.slotLabels.push(t)
      this.add(t)
    }

    this.refresh()
  }

  refresh(): void {
    const scene = this.scene
    const width = scene.scale.width
    const height = PANEL_SIZES.eggPanelHeight

    this.gfx.clear()
    this.gfx.fillStyle(COLORS.panelAlt, 1)
    this.gfx.fillRoundedRect(0, 0, width, height, RADIUS)

    const slots = 10
    const slotSize = EGG_SLOT.size
    const gap = EGG_SLOT.gap
    const totalWidth = slots * slotSize + (slots - 1) * gap
    let startX = Math.max(MARGIN || 24, (width - totalWidth) / 2)
    const y = 40

    for (let i = 0; i < slots; i++) {
      const x = startX + i * (slotSize + gap)
      this.gfx.fillStyle(0x556633, 1)
      this.gfx.fillRoundedRect(x, y, slotSize, slotSize, 8)

      const lbl = this.slotLabels[i]
      lbl.setText(`Egg ${i + 1}`)
      lbl.setX(x + slotSize / 2 - lbl.width / 2)
      lbl.setY(y + slotSize + 6)
    }
  }
}
