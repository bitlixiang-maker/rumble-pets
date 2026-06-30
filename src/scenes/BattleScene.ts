import Phaser from 'phaser'
import LayoutManager from '../core/LayoutManager'
import TopHUD from '../ui/TopHUD'
import EnemyPanel from '../ui/EnemyPanel'
import EggPanel from '../ui/EggPanel'
import PlayerPanel from '../ui/PlayerPanel'
import BattleLogPanel from '../ui/BattleLogPanel'
import PrimaryButton from '../ui/PrimaryButton'

// BattleScene: visual prototype only. Uses LayoutManager for all positions.
export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
  }

  create(): void {
    // Initialize layout system so LayoutManager computes rectangles for this resolution
    LayoutManager.initialize(this.scale.width, this.scale.height)

    // Acquire rectangles for each UI block
    const topRect = LayoutManager.getTopHUDRect()
    const enemyRect = LayoutManager.getEnemyPanelRect()
    const eggRect = LayoutManager.getEggPanelRect()
    const playerRect = LayoutManager.getPlayerPanelRect()
    const logRect = LayoutManager.getBattleLogRect()
    const btnRect = LayoutManager.getPrimaryButtonRect()

    // Create containers using rectangles from LayoutManager
    const top = new TopHUD(this, topRect)
    this.add.existing(top).setPosition(topRect.x, topRect.y)

    const enemies = new EnemyPanel(this, enemyRect)
    this.add.existing(enemies).setPosition(enemyRect.x, enemyRect.y)

    const log = new BattleLogPanel(this, logRect)
    this.add.existing(log).setPosition(logRect.x, logRect.y)

    const eggs = new EggPanel(this, eggRect)
    this.add.existing(eggs).setPosition(eggRect.x, eggRect.y)

    const players = new PlayerPanel(this, playerRect)
    this.add.existing(players).setPosition(playerRect.x, playerRect.y)

    const btn = new PrimaryButton(this, btnRect, 'START BATTLE')
    this.add.existing(btn).setPosition(btnRect.x + btnRect.width / 2, btnRect.y + btnRect.height / 2)

    // Provide fake sample data to each panel via refresh(data)
    top.refresh({ coin: 500, wave: '1/10', timer: '00:00' })

    enemies.refresh({
      monsters: [
        { name: 'Zombie', hp: 100, maxHp: 100 },
        { name: 'Skeleton', hp: 60, maxHp: 80 },
        { name: 'Ghoul', hp: 30, maxHp: 50 }
      ]
    })

    log.refresh({ logs: ['Battle Start!', 'Enemy appeared.', 'Waiting...'] })

    eggs.refresh({ eggs: Array.from({ length: 10 }, (_, i) => `Egg ${i + 1}`) })

    players.refresh({
      pets: [
        { name: 'Cat', atk: 10, target: 'x1' },
        { name: 'Dog', atk: 8, target: 'x2' },
        { name: 'Monkey', atk: 15, target: 'x1' }
      ]
    })

    btn.refresh({})
  }
}
