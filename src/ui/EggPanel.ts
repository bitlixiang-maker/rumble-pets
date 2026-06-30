import Phaser from 'phaser'
import { FONT_SIZES, COLORS } from './UIConstants'

export default class EggPanel extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics
  private labels: Phaser.GameObjects.Text[] = []
  private rect: Phaser.Geom.Rectangle

  constructor(scene: Phaser.Scene, rect: Phaser.Geom.Rectangle) {
    super(scene, 0, 0)
    this.rect = rect
    this.bg = scene.add.graphics()
    this.add(this.bg)

    for (let i = 0; i < 10; i++) {
      const t = scene.add.text(0, 0, `Egg ${i + 1}`, { fontSize: `${FONT_SIZES.small}px`, color: COLORS.text })
      this.labels.push(t)
      this.add(t)
    }

    this.draw()
  }

  private draw(): void {
    this.bg.clear()
    this.bg.fillStyle(0x2b2b2b, 1)
    this.bg.fillRoundedRect(0, 0, this.rect.width, this.rect.height, 8)
    this.bg.lineStyle(2, 0x666666, 1)
    this.bg.strokeRoundedRect(0, 0, this.rect.width, this.rect.height, 8)

    const slotSize = 64
    const gap = 12
    const totalWidth = slotSize * 10 + gap * 9
    const startX = Math.max(12, Math.floor((this.rect.width - totalWidth) / 2))
    const y = 16

    for (let i = 0; i < 10; i++) {
      const x = startX + i * (slotSize + gap)
      this.bg.fillStyle(0x333333, 1)
      this.bg.fillRoundedRect(x, y, slotSize, slotSize, 8)

      const lbl = this.labels[i]
      lbl.setX(x + slotSize / 2 - lbl.width / 2)
      lbl.setY(y + slotSize + 6)
    }
  }

  refresh(data: { eggs: string[] }) {
    const eggs = data.eggs ?? []
    for (let i = 0; i < 10; i++) {
      this.labels[i].setText(eggs[i] ?? `Egg ${i + 1}`)
    }
  }
}
