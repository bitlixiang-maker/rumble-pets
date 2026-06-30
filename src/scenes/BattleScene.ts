import Phaser from 'phaser'
import LayoutManager from '../core/LayoutManager'
import TopHUD from '../ui/TopHUD'
import EnemyPanel from '../ui/EnemyPanel'
import EggPanel from '../ui/EggPanel'
import PlayerPanel from '../ui/PlayerPanel'
import BattleLogPanel from '../ui/BattleLogPanel'
import PrimaryButton from '../ui/PrimaryButton'
import ConfigManager from '../core/ConfigManager'
import { Monster, Pet, Player } from '../types'

// BattleScene: data-driven visual prototype with simple automated battle.
export default class BattleScene extends Phaser.Scene {
  private monsters: Monster[] = []
  private pets: Pet[] = []
  private player!: Player
  private logs: string[] = []
  private attackTimer?: Phaser.Time.TimerEvent
  private petIndex = 0

  constructor() {
    super({ key: 'BattleScene' })
  }

  async create(): Promise<void> {
    // Ensure configuration is loaded
    await ConfigManager.initialize()

    // Load current level via ConfigManager (no direct JSON access)
    const level = ConfigManager.getLevel(1)

    // Load monsters from level.monsterPool
    this.monsters = ConfigManager.getMonsters(level.monsterPool)

    // Load player information
    this.player = ConfigManager.getPlayer()

    // Load pet information
    this.pets = ConfigManager.getPets()

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

    // Initial UI refresh from configuration data
    enemies.refresh(this.monsters)
    eggsPanel.refresh(eggs)
    players.refresh(this.player, this.pets)
    top.refresh(this.player)
    log.refresh([])
    btn.refresh({ label: 'START BATTLE', disabled: false })

    // wire up button press to start battle
    btn.on('pressed', () => this.startBattle(enemies, log, btn))
  }

  private startBattle(enemies: EnemyPanel, logPanel: BattleLogPanel, btn: PrimaryButton): void {
    // Disable button and set label
    btn.refresh({ label: 'FIGHTING...', disabled: true })

    // Add initial log entry
    this.appendLog('Battle Started')

    // Start timed attack loop (1000ms)
    this.attackTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.attackTick(enemies, logPanel, btn),
      callbackScope: this
    })
  }

  private attackTick(enemies: EnemyPanel, logPanel: BattleLogPanel, btn: PrimaryButton): void {
    // Find next pet that will attack
    if (this.pets.length === 0) return
    const pet = this.pets[this.petIndex]

    // Find first alive monster
    const target = this.monsters.find(m => (m.hp ?? 0) > 0)
    if (!target) {
      // All monsters defeated
      this.finishBattle(enemies, logPanel, btn)
      return
    }

    // Perform attack: damage = pet.atk
    const damage = pet.atk
    target.hp = Math.max(0, (target.hp ?? target.maxHp) - damage)

    // Log attack
    this.appendLog(`${pet.name} attacks ${target.name}`)

    if ((target.hp ?? 0) <= 0) {
      this.appendLog(`${target.name} defeated`)
    } else {
      this.appendLog(`${target.name} HP -${damage}`)
    }

    // Refresh UI immediately
    enemies.refresh(this.monsters)
    logPanel.refresh(this.logs)

    // Advance pet index
    this.petIndex = (this.petIndex + 1) % this.pets.length

    // If after attack no alive monsters, finish
    if (!this.monsters.some(m => (m.hp ?? 0) > 0)) {
      this.finishBattle(enemies, logPanel, btn)
    }
  }

  private appendLog(message: string): void {
    this.logs.push(message)
    // keep only the latest 8 messages
    while (this.logs.length > 8) this.logs.shift()
  }

  private finishBattle(enemies: EnemyPanel, logPanel: BattleLogPanel, btn: PrimaryButton): void {
    // Stop timer
    if (this.attackTimer) {
      this.attackTimer.remove(false)
      this.attackTimer = undefined
    }

    // Final refresh
    enemies.refresh(this.monsters)
    this.appendLog('Battle Finished')
    logPanel.refresh(this.logs)

    // Update button
    btn.refresh({ label: 'VICTORY', disabled: true })
  }
}
