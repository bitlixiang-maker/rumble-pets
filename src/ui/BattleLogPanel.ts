import Phaser from 'phaser'
import { PANEL_SIZES, RADIUS, COLORS, FONT_SIZES } from './UIConstants'

export interface BattleLogItem {
  timestamp: string
  message: string
}

export default class BattleLogPanel extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics
  private text: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)
    this.gfx = scene.add.graphics()
    this.text = scene.add.text(0, 0, '', { fontSize: `${FONT_SIZES.small}px`, color: COLORS.textMuted })

    this.add([this.gfx, this.text])
    this.refresh()
  }

  refresh(data?: { logs?: BattleLogItem[] }): void {
    const width = PANEL_SIZES.logPanelWidth
    const height = PANEL_SIZES.logPanelHeight

    this.gfx.clear()
    this.gfx.fillStyle(COLORS.panelAlt, 1)
    this.gfx.fillRoundedRect(0, 0, width, height, RADIUS)

    const logs = data?.logs ?? [
      { timestamp: new Date().toISOString(), message: 'Battle Log' },
      { timestamp: new Date().toISOString(), message: 'Battle initialized' },
      { timestamp: new Date().toISOString(), message: 'Player ready' }
    ]

    this.text.setText(logs.map(l => l.message).join('\n'))
    this.text.setX(12)
    this.text.setY(12)
  }
}
