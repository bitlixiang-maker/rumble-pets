import Phaser from 'phaser'
import LayoutManager from '../core/LayoutManager'
import TopHUD from '../ui/TopHUD'
import EnemyPanel from '../ui/EnemyPanel'
import EggPanel from '../ui/EggPanel'
import PlayerPanel from '../ui/PlayerPanel'
import BattleLogPanel from '../ui/BattleLogPanel'
import PrimaryButton from '../ui/PrimaryButton'
import ConfigManager from '../core/ConfigManager'

// BattleScene: fully data-driven visual prototype.
export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
  }

  async create(): Promise<void> {
    // Ensure configuration is loaded
    await ConfigManager.initialize()

    // Load current level via ConfigManager (no direct JSON access)
    const level = ConfigManager.getLevel(1)

    // Load monsters from level.monsterPool
    const monsters = ConfigManager.getMonsters(level.monsterPool)

    // Load player information
    const player = ConfigManager.getPlayer()

    // Load pet information
    const pets = ConfigManager.getPets()

    // Load egg information
    const eggs = ConfigManager.getEggs()

    // Initialize layout
    LayoutManager.initialize(this.scale.width, this.scale.height)
    const topRect = LayoutManager.getTopHUDRect()
    const enemyRect = LayoutManager.getEnemyPanelRect()
    const eggRect = LayoutManager.getEggPanelRect()
    const playerRect = LayoutManager.getPlayerPanelRect()
    const logRect = LayoutManager.getBattleLogRect()
    const btnRect = LayoutManager.getPrimaryButtonRect()

    // Create containers and position them using rectangles from LayoutManager
    const top = new TopHUD(this, topRect)
    this.add.existing(top).setPosition(topRect.x, topRect.y)

    const enemies = new EnemyPanel(this, enemyRect)
    this.add.existing(enemies).setPosition(enemyRect.x, enemyRect.y)

    const log = new BattleLogPanel(this, logRect)
    this.add.existing(log).setPosition(logRect.x, logRect.y)

    const eggsPanel = new EggPanel(this, eggRect)
    this.add.existing(eggsPanel).setPosition(eggRect.x, eggRect.y)

    const players = new PlayerPanel(this, playerRect)
    this.add.existing(players).setPosition(playerRect.x, playerRect.y)

    const btn = new PrimaryButton(this, btnRect, 'START BATTLE')
    this.add.existing(btn).setPosition(btnRect.x + btnRect.width / 2, btnRect.y + btnRect.height / 2)

    // Pass data into UI Panels (no inline objects; data comes from ConfigManager)
    enemies.refresh(monsters)
    eggsPanel.refresh(eggs)
    players.refresh(player, pets)
    top.refresh(player)
    log.refresh([])
    btn.refresh({})
  }
}
