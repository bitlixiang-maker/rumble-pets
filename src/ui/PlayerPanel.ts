import Phaser from 'phaser'
import { FONT_SIZES, COLORS } from './UIConstants'

export default class PlayerPanel extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics
  private pets: { container: Phaser.GameObjects.Container; name: Phaser.GameObjects.Text; atk: Phaser.GameObjects.Text; target: Phaser.GameObjects.Text }[] = []
  private rect: Phaser.Geom.Rectangle

  constructor(scene: Phaser.Scene, rect: Phaser.Geom.Rectangle) {
    super(scene, 0, 0)
    this.rect = rect
    this.bg = scene.add.graphics()
    this.add(this.bg)

    for (let i = 0; i < 3; i++) {
      const c = scene.add.container(0, 0)
      const name = scene.add.text(0, 0, `Pet ${i + 1}`, { fontSize: `${FONT_SIZES.normal}px`, color: COLORS.text })
      const atk = scene.add.text(0, 0, `ATK 0`, { fontSize: `${FONT_SIZES.small}px`, color: COLORS.text })
      const target = scene.add.text(0, 0, `Target x0`, { fontSize: `${FONT_SIZES.small}px`, color: COLORS.text })
      c.add([name, atk, target])
      this.pets.push({ container: c, name, atk, target })
      this.add(c)
    }

    this.draw()
  }

  private draw(): void {
    this.bg.clear()
    this.bg.fillStyle(0x2b2b2b, 1)
    this.bg.fillRoundedRect(0, 0, this.rect.width, this.rect.height, 8)
    this.bg.lineStyle(2, 0x666666, 1)
    this.bg.strokeRoundedRect(0, 0, this.rect.width, this.rect.height, 8)

    const slotWidth = Math.floor(this.rect.width / 3)
    const cy = Math.floor(this.rect.height / 2)

    for (let i = 0; i < 3; i++) {
      const p = this.pets[i]
      const slotX = i * slotWidth + Math.floor((slotWidth - 200) / 2)
      p.container.setPosition(slotX, cy - 30)
      p.name.setX(0)
      p.name.setY(0)
      p.atk.setX(0)
      p.atk.setY(28)
      p.target.setX(0)
      p.target.setY(48)
    }
  }

  refresh(data: { pets: { name: string; atk: number; target: string }[] }) {
    const pets = data.pets ?? []
    for (let i = 0; i < 3; i++) {
      const src = pets[i] ?? { name: `Pet ${i + 1}`, atk: 0, target: 'x0' }
      const p = this.pets[i]
      p.name.setText(src.name)
      p.atk.setText(`ATK ${src.atk}`)
      p.target.setText(`Target ${src.target}`)
    }
  }
}
