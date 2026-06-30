import Phaser from 'phaser'
import { PANEL_SIZES, RADIUS, COLORS, FONT_SIZES, MONSTER_SLOT } from './UIConstants'

export default class EnemyPanel extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics
  private labels: Phaser.GameObjects.Text[] = []

  constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
    super(scene, x, y)
    this.gfx = scene.add.graphics()
    this.add(this.gfx)

    for (let i = 0; i < 3; i++) {
      const t = scene.add.text(0, 0, `Enemy ${i + 1}`, { fontSize: `${FONT_SIZES.normal}px`, color: COLORS.text })
      this.labels.push(t)
      this.add(t)
    }

    this.refresh()
  }

  refresh(): void {
    const scene = this.scene
    const width = scene.scale.width
    const height = PANEL_SIZES.enemyPanelHeight

    this.gfx.clear()
    this.gfx.fillStyle(COLORS.panelAlt, 1)
    this.gfx.fillRoundedRect(0, 0, width, height, RADIUS)

    const count = 3
    const slotW = width / count
    const cxOffset = slotW / 2
    const cy = height / 2
    const size = MONSTER_SLOT.size

    for (let i = 0; i < count; i++) {
      const cx = slotW * i + cxOffset
      this.gfx.fillStyle(0x884444, 1)
      this.gfx.fillCircle(cx, cy - 12, size / 2)

      const t = this.labels[i]
      t.setText(`Enemy ${i + 1}`)
      t.setX(cx - t.width / 2)
      t.setY(cy + size / 2 - 6)
    }
  }
}
