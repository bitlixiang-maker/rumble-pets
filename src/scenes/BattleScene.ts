import Phaser from 'phaser'
import TopHUD from '../ui/TopHUD'
import EnemyPanel from '../ui/EnemyPanel'
import EggPanel from '../ui/EggPanel'
import PlayerPanel from '../ui/PlayerPanel'
import BattleLogPanel from '../ui/BattleLogPanel'
import PrimaryButton from '../ui/PrimaryButton'
import LayoutManager from '../core/LayoutManager'

// BattleScene: assemble UI only. Position components via LayoutManager
// and call refresh() on each. No gameplay, events, or animations here.
export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
  }

  create() {
    const w = this.scale.width
    const h = this.scale.height

    LayoutManager.initialize(w, h)

    const topRect = LayoutManager.getTopHUDRect()
    const top = new TopHUD(this, topRect.x, topRect.y, topRect.width)
    this.add.existing(top)

    const enemyRect = LayoutManager.getEnemyPanelRect()
    const enemy = new EnemyPanel(this, enemyRect.x, enemyRect.y, enemyRect.width)
    this.add.existing(enemy)

    const eggRect = LayoutManager.getEggPanelRect()
    const egg = new EggPanel(this, eggRect.x, eggRect.y, eggRect.width)
    this.add.existing(egg)

    const playerRect = LayoutManager.getPlayerPanelRect()
    const player = new PlayerPanel(this, playerRect.x, playerRect.y, playerRect.width)
    this.add.existing(player)

    const logRect = LayoutManager.getBattleLogRect()
    const log = new BattleLogPanel(this, logRect.x, logRect.y)
    this.add.existing(log)

    const btnRect = LayoutManager.getPrimaryButtonRect()
    const btn = new PrimaryButton(this, btnRect.centerX, btnRect.centerY, 'End Turn')
    this.add.existing(btn)

    // call refresh on each panel (no gameplay data passed)
    top.refresh()
    enemy.refresh()
    egg.refresh()
    player.refresh()
    log.refresh()
    btn.refresh()
  }
}
