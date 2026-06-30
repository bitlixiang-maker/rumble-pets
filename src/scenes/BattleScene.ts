import Phaser from 'phaser'
import LayoutManager from '../core/LayoutManager'
import TopHUD from '../ui/TopHUD'
import EnemyPanel from '../ui/EnemyPanel'
import EggPanel from '../ui/EggPanel'
import PlayerPanel from '../ui/PlayerPanel'
import BattleLogPanel from '../ui/BattleLogPanel'
import PrimaryButton from '../ui/PrimaryButton'
import ConfigManager from '../core/ConfigManager'
import BattleSystem from '../core/BattleSystem'
import MonsterSystem from '../core/MonsterSystem'
import { Monster, Pet, Player } from '../types'

// BattleScene: no battle logic here. Only subscribes to BattleSystem events and uses MonsterSystem.
export default class BattleScene extends Phaser.Scene {
  private configMonsters: Monster[] = []
  private pets: Pet[] = []
  private player!: Player
  private logs: string[] = []
  private battleSystem!: BattleSystem
  private monsterSystem!: MonsterSystem

  // UI references to refresh from events
  private enemies?: EnemyPanel
  private logPanel?: BattleLogPanel
  private btn?: PrimaryButton

  constructor() {
    super({ key: 'BattleScene' })
  }

  async create(): Promise<void> {
    await ConfigManager.initialize()

    const level = ConfigManager.getLevel(1)
    this.configMonsters = ConfigManager.getMonsters(level.monsterPool)
    this.player = ConfigManager.getPlayer()
    this.pets = ConfigManager.getPets()
    const eggs = ConfigManager.getEggs()

    // Initialize MonsterSystem
    this.monsterSystem = new MonsterSystem()
    this.monsterSystem.initialize(this.configMonsters)

    // Initialize layout
    LayoutManager.initialize(this.scale.width, this.scale.height)
    const topRect = LayoutManager.getTopHUDRect()
    const enemyRect = LayoutManager.getEnemyPanelRect()
    const eggRect = LayoutManager.getEggPanelRect()
    const playerRect = LayoutManager.getPlayerPanelRect()
    const logRect = LayoutManager.getBattleLogRect()
    const btnRect = LayoutManager.getPrimaryButtonRect()

    const top = new TopHUD(this, topRect)
    this.add.existing(top).setPosition(topRect.x, topRect.y)

    this.enemies = new EnemyPanel(this, enemyRect)
    this.add.existing(this.enemies).setPosition(enemyRect.x, enemyRect.y)

    this.logPanel = new BattleLogPanel(this, logRect)
    this.add.existing(this.logPanel).setPosition(logRect.x, logRect.y)

    const eggsPanel = new EggPanel(this, eggRect)
    this.add.existing(eggsPanel).setPosition(eggRect.x, eggRect.y)

    const players = new PlayerPanel(this, playerRect)
    this.add.existing(players).setPosition(playerRect.x, playerRect.y)

    this.btn = new PrimaryButton(this, btnRect, 'START BATTLE')
    this.add.existing(this.btn).setPosition(btnRect.x + btnRect.width / 2, btnRect.y + btnRect.height / 2)

    // Initial UI: EnemyPanel should always use MonsterSystem.getAll()
    this.enemies.refresh(this.monsterSystem.getAll())
    eggsPanel.refresh(eggs)
    players.refresh(this.player, this.pets)
    top.refresh(this.player)
    this.logPanel.refresh([])
    this.btn.refresh({ label: 'START BATTLE', disabled: false })

    // Create BattleSystem (pure logic)
    this.battleSystem = new BattleSystem(1000)

    // Subscribe to BattleSystem events
    this.battleSystem.on('BattleStarted', () => {
      this.appendLog('Battle Started')
      this.logPanel?.refresh(this.logs)
      this.btn?.refresh({ label: 'FIGHTING...', disabled: true })
    })

    this.battleSystem.on('BattleTick', (_tickCount: number) => {
      // Forward tick to MonsterSystem; MonsterSystem owns all damage logic
      this.monsterSystem.onBattleTick()
    })

    // Only update button state on BattleFinished; MonsterSystem will emit AllMonsterDead and we handle logs there.
    this.battleSystem.on('BattleFinished', () => {
      this.btn?.refresh({ label: 'VICTORY', disabled: true })
    })

    // Subscribe to MonsterSystem events to update logs and UI
    this.monsterSystem.on('MonsterUpdated', (p: any) => {
      this.appendLog(`${p.name} -${p.damage} HP`)
      this.logPanel?.refresh(this.logs)
      this.enemies?.refresh(this.monsterSystem.getAll())
    })

    this.monsterSystem.on('MonsterDead', (p: any) => {
      this.appendLog(`${p.name} Dead`)
      this.logPanel?.refresh(this.logs)
      this.enemies?.refresh(this.monsterSystem.getAll())
    })

    this.monsterSystem.on('AllMonsterDead', () => {
      this.appendLog('Battle Finished')
      this.logPanel?.refresh(this.logs)
      // stop the BattleSystem to cease ticks
      this.battleSystem.stop()
    })

    // wire button to start the pure BattleSystem
    this.btn.on('pressed', () => {
      this.battleSystem.start()
    })
  }

  update(time: number, delta: number): void {
    // forward delta to BattleSystem (delta is in ms)
    if (this.battleSystem) this.battleSystem.update(delta)
  }

  private appendLog(message: string): void {
    this.logs.push(message)
    while (this.logs.length > 1000) this.logs.shift()
  }
}
