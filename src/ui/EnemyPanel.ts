import Phaser from 'phaser'
import { FONT_SIZES, COLORS } from './UIConstants'
import { Monster } from '../types'

export default class EnemyPanel extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics
  private monsters: { container: Phaser.GameObjects.Container; name: Phaser.GameObjects.Text; hpBar: Phaser.GameObjects.Graphics; hpText: Phaser.GameObjects.Text }[] = []
  private rect: Phaser.Geom.Rectangle

  constructor(scene: Phaser.Scene, rect: Phaser.Geom.Rectangle) {
    super(scene, 0, 0)
    this.rect = rect
    this.bg = scene.add.graphics()
    this.add(this.bg)

    // Create three monster slots
    for (let i = 0; i < 3; i++) {
      const c = scene.add.container(0, 0)
      const name = scene.add.text(0, 0, `Monster ${i + 1}`, { fontSize: `${FONT_SIZES.normal}px`, color: COLORS.text })
      const hpBar = scene.add.graphics()
      const hpText = scene.add.text(0, 0, '0/0', { fontSize: `${FONT_SIZES.small}px`, color: COLORS.text })
      c.add([name, hpBar, hpText])
      this.monsters.push({ container: c, name, hpBar, hpText })
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

    // Position monster slots evenly within rect
    const slotWidth = Math.floor(this.rect.width / 3)
    const cy = Math.floor(this.rect.height / 2)

    for (let i = 0; i < 3; i++) {
      const m = this.monsters[i]
      const slotX = i * slotWidth + Math.floor((slotWidth - 200) / 2)
      m.container.setPosition(slotX, cy - 40)
      m.name.setText(m.name.text)
      m.name.setX(0)
      m.name.setY(0)

      // hp bar background
      m.hpBar.clear()
      m.hpBar.fillStyle(0x333333, 1)
      m.hpBar.fillRoundedRect(0, 28, 200, 18, 6)

      m.hpText.setX(0)
      m.hpText.setY(28)
    }
  }

  // Accepts array of Monster objects and updates visuals immediately.
  refresh(monsters: Monster[]): void {
    for (let i = 0; i < 3; i++) {
      const src = monsters[i] ?? { id: `m${i + 1}`, name: `Enemy ${i + 1}`, hp: 0, maxHp: 0 }
      const m = this.monsters[i]
      m.name.setText(src.name)

      // If defeated, display DEFEATED and grey bar
      if ((src.hp ?? 0) <= 0) {
        m.hpBar.clear()
        m.hpBar.fillStyle(0x222222, 1)
        m.hpBar.fillRoundedRect(0, 28, 200, 18, 6)
        m.hpText.setText('DEFEATED')
      } else {
        const pct = src.maxHp > 0 ? (src.hp ?? 0) / src.maxHp : 0
        m.hpBar.clear()
        m.hpBar.fillStyle(0x333333, 1)
        m.hpBar.fillRoundedRect(0, 28, 200, 18, 6)
        m.hpBar.fillStyle(0x44cc44, 1)
        m.hpBar.fillRoundedRect(0, 28, Math.max(0, Math.floor(200 * pct)), 18, 6)
        m.hpText.setText(`${src.hp}/${src.maxHp} (${Math.floor(pct * 100)}%)`)
      }
    }
  }
}
