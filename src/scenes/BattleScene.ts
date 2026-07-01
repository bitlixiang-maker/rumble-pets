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
import PetSystem from '../core/PetSystem'
import PlayerRuntime from '../core/PlayerRuntime'
import EggSystem, { RuntimeEgg } from '../core/EggSystem'
import { Monster, Pet, Player } from '../types'

// BattleScene: composition root only. Forwards BattleTick to PetSystem and listens to PetAttack events.
export default class BattleScene extends Phaser.Scene {
  private configMonsters: Monster[] = []
  private petsConfig: Pet[] = []
  private playerConfig!: Player
  private logs: string[] = []
  private battleSystem!: BattleSystem
  private monsterSystem!: MonsterSystem
  private petSystem!: PetSystem
  private playerRuntime!: PlayerRuntime
  private eggSystem!: EggSystem

  // UI references to refresh from events
  private enemies?: EnemyPanel
  private logPanel?: BattleLogPanel
  private btn?: PrimaryButton
  private playersUI?: PlayerPanel
  private topUI?: TopHUD
  private eggsUI?: EggPanel

  constructor() {
    super({ key: 'BattleScene' })
  }

  async create(): Promise<void> {
    await ConfigManager.initialize()

    const level = ConfigManager.getLevel(1)
    this.configMonsters = ConfigManager.getMonsters(level.monsterPool)
    this.playerConfig = ConfigManager.getPlayer()
    this.petsConfig = ConfigManager.getPets()
    const eggDefs = ConfigManager.getEggs()

    // Create numeric mapping for egg ids (string -> number)
    // Numeric id will be the index in eggDefs starting from 1
    const strToNum: Record<string, number> = {}
    const numToDef: Record<number, { cost: number; id: string }> = {}
    for (let i = 0; i < eggDefs.length; i++) {
      const numId = i + 1
      strToNum[eggDefs[i].id] = numId
      numToDef[numId] = { cost: eggDefs[i].cost, id: eggDefs[i].id }
    }

    // Determine pool and weights from level if present, otherwise fallback to all eggs
    const rawPool = (level as any).eggPool
    const rawWeights = (level as any).eggWeights

    let poolNums: number[] = []
    let weightsNums: number[] = []

    if (Array.isArray(rawPool) && rawPool.length > 0) {
      // map string ids to numeric ids, ignore unknown entries
      for (const id of rawPool) {
        if (typeof id === 'string' && strToNum[id] !== undefined) poolNums.push(strToNum[id])
      }
      if (Array.isArray(rawWeights) && rawWeights.length === rawPool.length) {
        weightsNums = rawWeights.map(w => Number(w) || 1)
      } else if (rawWeights && typeof rawWeights === 'object') {
        // object mapping id->weight
        weightsNums = rawPool.map((id: string) => Number((rawWeights as any)[id]) || 1)
      } else {
        weightsNums = poolNums.map(() => 1)
      }
    } else {
      // fallback: use all egg defs
      poolNums = Object.keys(numToDef).map(k => Number(k))
      weightsNums = poolNums.map(() => 1)
    }

    // Initialize MonsterSystem
    this.monsterSystem = new MonsterSystem()
    this.monsterSystem.initialize(this.configMonsters)

    // Initialize PetSystem
    this.petSystem = new PetSystem()
    this.petSystem.initialize(this.petsConfig)

    // Initialize EggSystem
    this.eggSystem = new EggSystem()
    // Pass pool (number ids), weights, and egg definition map (number -> cost)
    const eggDefMap: Record<number, { cost: number }> = {}
    for (const k of Object.keys(numToDef)) {
      eggDefMap[Number(k)] = { cost: numToDef[Number(k)].cost }
    }
    this.eggSystem.initialize(poolNums, weightsNums, eggDefMap)

    // Initialize PlayerRuntime from config (include coins from config)
    this.playerRuntime = new PlayerRuntime(this.playerConfig.id, this.playerConfig.level ? 100 : 100, this.playerConfig['hp'] ?? undefined, this.playerConfig.coin ?? 0)

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
    this.topUI = top

    this.enemies = new EnemyPanel(this, enemyRect)
    this.add.existing(this.enemies).setPosition(enemyRect.x, enemyRect.y)

    this.logPanel = new BattleLogPanel(this, logRect)
    this.add.existing(this.logPanel).setPosition(logRect.x, logRect.y)

    this.eggsUI = new EggPanel(this, eggRect)
    this.add.existing(this.eggsUI).setPosition(eggRect.x, eggRect.y)

    this.playersUI = new PlayerPanel(this, playerRect)
    this.add.existing(this.playersUI).setPosition(playerRect.x, playerRect.y)

    this.btn = new PrimaryButton(this, btnRect, 'START BATTLE')
    this.add.existing(this.btn).setPosition(btnRect.x + btnRect.width / 2, btnRect.y + btnRect.height / 2)

    // Initial UI
    this.enemies.refresh(this.monsterSystem.getAll())
    this.eggsUI.refresh([])
    this.playersUI.refresh(this.playerConfig, this.petsConfig)
    top.refresh(this.playerConfig)
    this.logPanel.refresh([])
    this.btn.refresh({ label: 'START BATTLE', disabled: false })

    // Create BattleSystem (pure logic)
    this.battleSystem = new BattleSystem(1000)

    // Subscribe to BattleSystem events -> forward tick to PetSystem (composition root)
    this.battleSystem.on('BattleStarted', () => {
      this.appendLog('Battle Started')
      this.logPanel?.refresh(this.logs)
      this.btn?.refresh({ label: 'FIGHTING...', disabled: true })

      // On battle start, generate eggs via EggSystem (EggSystem is pure and does not access ConfigManager)
      this.eggSystem.generate()
    })

    this.battleSystem.on('BattleTick', (_tickCount: number) => {
      // Scene forwards ticks to PetSystem only
      this.petSystem.onBattleTick()
    })

    this.battleSystem.on('BattleFinished', () => {
      this.btn?.refresh({ label: 'VICTORY', disabled: true })
    })

    // PetSystem emits PetAttack; Scene listens and forwards damage to MonsterSystem
    this.petSystem.on('PetAttack', (p: any) => {
      // Log attack (no damage calc here)
      const pet = p.pet
      const damage = p.damage
      this.appendLog(`${pet.name} attacks`)
      this.logPanel?.refresh(this.logs)

      // Find first alive monster and apply damage via MonsterSystem
      const firstAlive = this.monsterSystem.getAll().find(m => (m.hp ?? 0) > 0)
      if (firstAlive) {
        this.monsterSystem.damage(firstAlive.id, damage)
      }
    })

    // Subscribe to EggSystem events
    this.eggSystem.on('EggGenerated', (eggs: RuntimeEgg[]) => {
      // refresh egg UI with runtime eggs (eggId is numeric)
      this.eggsUI?.refresh(eggs)
    })

    this.eggSystem.on('EggOpened', (egg: RuntimeEgg) => {
      // For now just refresh UI
      this.eggsUI?.refresh(this.eggSystem.getAll())
    })

    // Handle egg slot clicks coming from UI
    this.eggsUI.on('SlotClicked', (slotIndex: number) => {
      const e = this.eggSystem.get(slotIndex)
      if (!e) return

      // Scene must check coins and spend before opening egg
      if (!this.playerRuntime.canSpendCoins(e.cost)) {
        this.appendLog('Not enough Coins')
        this.logPanel?.refresh(this.logs)
        return
      }

      // Spend coins and then open egg
      const spent = this.playerRuntime.spendCoins(e.cost)
      if (spent) {
        this.eggSystem.open(slotIndex)
        this.appendLog(`Opened Egg #${slotIndex + 1}`)
        this.logPanel?.refresh(this.logs)
      } else {
        // spendCoins emits CoinsNotEnough; also log
        this.appendLog('Not enough Coins')
        this.logPanel?.refresh(this.logs)
      }
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

    // When monsters attack, scene will forward damage to PlayerRuntime
    this.monsterSystem.on('MonsterAttack', (p: any) => {
      this.appendLog(`${p.name} attacks Player`)
      this.logPanel?.refresh(this.logs)
      // Apply damage to player via PlayerRuntime
      const dmg = p.attack
      this.playerRuntime.damage(dmg)
    })

    this.monsterSystem.on('AllMonsterDead', () => {
      this.appendLog('Battle Finished')
      this.logPanel?.refresh(this.logs)
      // stop the BattleSystem to cease ticks
      this.battleSystem.stop()
    })

    // PlayerRuntime events
    this.playerRuntime.on('PlayerUpdated', (p: any) => {
      this.appendLog(`Player -${p.damage} HP`)
      this.logPanel?.refresh(this.logs)
      // Refresh HUD and player panel
      const playerForUI = { ...this.playerConfig, currentHP: p.hp, maxHP: p.maxHp, coin: this.playerRuntime.getCoins() }
      this.topUI?.refresh(playerForUI as any)
      this.playersUI?.refresh(playerForUI as any, this.petsConfig)
    })

    this.playerRuntime.on('PlayerDead', () => {
      this.appendLog('Player Dead')
      this.logPanel?.refresh(this.logs)
      // stop battle and set button to DEFEAT
      this.battleSystem.stop()
      this.btn?.refresh({ label: 'DEFEAT', disabled: true })
    })

    this.playerRuntime.on('CoinsChanged', (payload: any) => {
      // Update HUD UI with new coin value
      const playerForUI = { ...this.playerConfig, coin: payload.coins }
      this.topUI?.refresh(playerForUI as any)
    })

    this.playerRuntime.on('CoinsNotEnough', () => {
      // No system event logging; scene already logs user-facing message when needed
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
