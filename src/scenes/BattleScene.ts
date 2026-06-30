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
// NOTE: battle runtime state is a copy of configuration data. ConfigManager
// values are treated as immutable.
export default class BattleScene extends Phaser.Scene {
  private configMonsters: Monster[] = [] // original copies from ConfigManager (immutable)
  private battleMonsters: Monster[] = [] // runtime mutable copies used during battle
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

    // Load monsters from level.monsterPool (immutable config objects)
    this.configMonsters = ConfigManager.getMonsters(level.monsterPool)

    // Create a runtime copy used for battle so we never mutate ConfigManager data
    this.battleMonsters = this.configMonsters.map(m => ({ ...m, hp: m.hp ?? m.maxHp }))

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

    // Initial UI refresh from configuration/runtime copies
    enemies.refresh(this.battleMonsters)
    eggsPanel.refresh(eggs)
    players.refresh(this.player, this.pets)
    top.refresh(this.player)
    log.refresh([])
    btn.refresh({ label: 'START BATTLE', disabled: false })

    // wire up button press to start battle
    btn.on('pressed', () => this.startBattle(enemies, log, btn))
  }

  // Start the automatic battle loop. Creates a Phaser timer that calls performAttack every 1000ms.
  private startBattle(enemies: EnemyPanel, logPanel: BattleLogPanel, btn: PrimaryButton): void {
    // Ensure we use a fresh runtime copy so config remains immutable
    this.battleMonsters = this.configMonsters.map(m => ({ ...m, hp: m.hp ?? m.maxHp }))
    this.petIndex = 0
    this.logs = []

    // Disable button and set label
    btn.refresh({ label: 'FIGHTING...', disabled: true })

    // Add initial log entry
    this.appendLog('Battle Started')
    logPanel.refresh(this.logs)

    // Start timed attack loop (1000ms)
    this.attackTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.performAttack(enemies, logPanel, btn),
      callbackScope: this
    })
  }

  // performAttack: called every tick, performs a single pet attack
  private performAttack(enemies: EnemyPanel, logPanel: BattleLogPanel, btn: PrimaryButton): void {
    if (this.pets.length === 0) return
    const pet = this.pets[this.petIndex]

    const target = this.findNextAliveMonster()
    if (!target) {
      this.finishBattle(enemies, logPanel, btn)
      return
    }

    const damage = pet.atk
    // mutate runtime battle copy only
    target.hp = Math.max(0, (target.hp ?? target.maxHp) - damage)

    // Logging
    this.appendLog(`${pet.name} attacks ${target.name}`)
    if ((target.hp ?? 0) <= 0) {
      this.appendLog(`${target.name} defeated`)
    } else {
      this.appendLog(`${target.name} HP -${damage}`)
    }

    // Refresh UI immediately
    enemies.refresh(this.battleMonsters)
    logPanel.refresh(this.logs)

    // Advance pet index for round-robin
    this.petIndex = (this.petIndex + 1) % this.pets.length

    // Check end condition
    if (!this.battleMonsters.some(m => (m.hp ?? 0) > 0)) {
      this.finishBattle(enemies, logPanel, btn)
    }
  }

  // findNextAliveMonster: returns the first alive monster from the runtime battle copy
  private findNextAliveMonster(): Monster | undefined {
    return this.battleMonsters.find(m => (m.hp ?? 0) > 0)
  }

  // finishBattle: stops timer, updates UI and logs, updates button label
  private finishBattle(enemies: EnemyPanel, logPanel: BattleLogPanel, btn: PrimaryButton): void {
    if (this.attackTimer) {
      this.attackTimer.remove(false)
      this.attackTimer = undefined
    }

    enemies.refresh(this.battleMonsters)
    this.appendLog('Battle Finished')
    logPanel.refresh(this.logs)

    btn.refresh({ label: 'VICTORY', disabled: true })
  }

  // appendLog keeps the newest messages at the end and limits to 8 entries
  private appendLog(message: string): void {
    this.logs.push(message)
    while (this.logs.length > 8) this.logs.shift()
  }
}
