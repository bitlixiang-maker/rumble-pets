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

// BattleScene: composition root only. Manages turn flow wiring, forwards ticks, and refreshes UI.
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
  private currentLevel: number = 1

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

    // start at level 1 by default
    this.currentLevel = 1
    const level = ConfigManager.getLevel(this.currentLevel)
    this.configMonsters = ConfigManager.getMonsters(level.monsterPool)
    this.playerConfig = ConfigManager.getPlayer()
    this.petsConfig = ConfigManager.getPets()
    const eggDefs = ConfigManager.getEggs()

    // Create numeric mapping for egg ids (string -> number)
    // Numeric id will be the index in eggDefs starting from 1
    const strToNum: Record<string, number> = {}
    const numToDef: Record<number, { cost: number; id: string; possiblePets?: string[]; weights?: any }> = {}
    for (let i = 0; i < eggDefs.length; i++) {
      const numId = i + 1
      strToNum[eggDefs[i].id] = numId
      numToDef[numId] = { cost: eggDefs[i].cost, id: eggDefs[i].id, possiblePets: (eggDefs[i] as any).possiblePets, weights: (eggDefs[i] as any).weights }
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
    this.petSystem.initialize(this.petsConfig, Object.fromEntries(Object.entries(numToDef).map(([k, v]) => [k, v])))

    // Initialize EggSystem
    this.eggSystem = new EggSystem()
    // Pass pool (number ids), weights, and egg definition map (number -> cost)
    const eggDefMap: Record<number, { cost: number; possiblePets?: string[]; weights?: any }> = {}
    for (const k of Object.keys(numToDef)) {
      eggDefMap[Number(k)] = { cost: numToDef[Number(k)].cost, possiblePets: numToDef[Number(k)].possiblePets, weights: numToDef[Number(k)].weights }
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

    // Subscribe to BattleSystem events
    this.battleSystem.on('BattleStarted', () => {
      this.appendLog('Battle Started')
      this.logPanel?.refresh(this.logs)
      this.btn?.refresh({ label: 'FIGHTING...', disabled: true })

      // On battle start, begin first player turn via composition root
      this.startPlayerTurn()
    })

    this.battleSystem.on('BattleTick', () => {
      // BattleTick is a general timer event; Scene does NOT forward ticks automatically to gameplay systems.
      // Pet execution happens immediately on egg open; ticks are available for other purposes if needed.
    })

    this.battleSystem.on('BattleFinished', () => {
      this.btn?.refresh({ label: 'VICTORY', disabled: true })
    })

    // Subscribe to EggSystem events
    this.eggSystem.on('EggGenerated', (eggs: RuntimeEgg[]) => {
      // refresh egg UI with runtime eggs (eggId is numeric)
      this.eggsUI?.refresh(eggs)
    })

    this.eggSystem.on('EggOpened', (egg: RuntimeEgg) => {
      // When an egg is opened, let PetSystem roll and execute the pet effect
      // PetSystem will decide targets and emit PetExecuted
      this.petSystem.executeFromEgg(egg, this.monsterSystem.getAll())
      // refresh egg UI immediately
      this.eggsUI?.refresh(this.eggSystem.getAll())
    })

    // Listen for executed pet effects
    this.petSystem.on('PetExecuted', (p: any) => {
      const petName = p.petName
      const effect = p.effectType
      if (effect === 'Attack') {
        const targets: string[] = p.targets ?? []
        const value: number = p.value ?? 0
        // Forward damage to MonsterSystem for each target
        for (const tid of targets) {
          this.monsterSystem.damage(tid, value)
        }
        // Refresh enemy UI and append a single log line
        this.enemies?.refresh(this.monsterSystem.getAll())
        if (targets.length > 0) {
          const firstTarget = this.monsterSystem.getAll().find(m => m.id === targets[0])
          const targetName = firstTarget ? firstTarget.name : targets[0]
          this.appendLog(`${petName} attacked ${targetName}`)
        } else {
          this.appendLog(`${petName} attacked`)
        }
        this.logPanel?.refresh(this.logs)
      } else if (effect === 'HealHP') {
        const value: number = p.value ?? 0
        this.playerRuntime.heal(value)
        // Refresh HUD and PlayerPanel
        const playerForUI = { ...this.playerConfig, currentHP: this.playerRuntime.getCurrentHp(), maxHP: this.playerRuntime.getMaxHp(), coin: this.playerRuntime.getCoins() }
        this.topUI?.refresh(playerForUI as any)
        this.playersUI?.refresh(playerForUI as any, this.petsConfig)
        this.appendLog(`${petName} healed Player ${value} HP`)
        this.logPanel?.refresh(this.logs)
      } else if (effect === 'GainCoin') {
        const value: number = p.value ?? 0
        this.playerRuntime.gainCoin(value)
        const playerForUI = { ...this.playerConfig, currentHP: this.playerRuntime.getCurrentHp(), maxHP: this.playerRuntime.getMaxHp(), coin: this.playerRuntime.getCoins() }
        this.topUI?.refresh(playerForUI as any)
        this.playersUI?.refresh(playerForUI as any, this.petsConfig)
        this.appendLog(`${petName} gained ${value} Coins`)
        this.logPanel?.refresh(this.logs)
      } else {
        // Unknown effect: just log name
        this.appendLog(`${petName} executed ${effect}`)
        this.logPanel?.refresh(this.logs)
      }
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

    // When monsters attack (as counter or during monster turn), scene will forward damage to PlayerRuntime
    this.monsterSystem.on('MonsterAttack', (p: any) => {
      // This handler covers both immediate counterattacks (from damage) and MonsterTurn attacks
      this.appendLog(`${p.monsterName || p.name || 'Monster'} attacked Player for ${p.damage}`)
      this.logPanel?.refresh(this.logs)
      // Apply damage to player via PlayerRuntime
      const dmg = p.damage
      this.playerRuntime.damage(dmg)
    })

    // When MonsterTurn finishes, call finishMonsterTurn to decide next steps
    this.monsterSystem.on('MonsterTurnFinished', () => {
      this.finishMonsterTurn()
    })

    this.monsterSystem.on('AllMonsterDead', () => {
      this.appendLog('Battle Finished')
      this.logPanel?.refresh(this.logs)
      // stop the BattleSystem to cease ticks
      this.battleSystem.stop()
    })

    // PlayerRuntime events
    this.playerRuntime.on('PlayerUpdated', (p: any) => {
      // PlayerUpdated may come from damage or heal; normalize log entries to damage/healed where appropriate
      if (p.damage) {
        this.appendLog(`Player -${p.damage} HP`)
      } else if (p.healed) {
        this.appendLog(`Player +${p.healed} HP`)
      }
      this.logPanel?.refresh(this.logs)
      // Refresh HUD and player panel
      const playerForUI = { ...this.playerConfig, currentHP: p.hp, maxHP: p.maxHp, coin: this.playerRuntime.getCoins() }
      this.topUI?.refresh(playerForUI as any)
      this.playersUI?.refresh(playerForUI as any, this.petsConfig)
    })

    // Handle PlayerDead: execute defeat flow
    this.playerRuntime.on('PlayerDead', () => {
      this.handleDefeat()
    })

    this.playerRuntime.on('CoinsChanged', (payload: any) => {
      // Update HUD UI with new coin value
      const playerForUI = { ...this.playerConfig, coin: payload.coins }
      this.topUI?.refresh(playerForUI as any)
      this.playersUI?.refresh(playerForUI as any, this.petsConfig)
    })

    this.playerRuntime.on('CoinsNotEnough', () => {
      // No system event logging; scene already logs user-facing message when needed
    })

    // wire button to start the battle via composition root
    this.btn.on('pressed', () => {
      this.startBattle()
    })
  }

  update(time: number, delta: number): void {
    // forward delta to BattleSystem (delta is in ms)
    if (this.battleSystem) this.battleSystem.update(delta)
  }

  // Composition-root flow methods ---------------------------------
  // Start the battle (invoked by UI)
  public startBattle(): void {
    // Start the timer and emit BattleStarted; BattleStarted handler will begin player turn
    this.battleSystem.start()
  }

  // Start a player turn: clear eggs, generate, refresh UI and enable interaction
  public startPlayerTurn(): void {
    // Clear previous eggs
    this.eggSystem.reset()
    // Generate new eggs for this round
    this.eggSystem.generate()
    // Refresh egg UI
    this.eggsUI?.refresh(this.eggSystem.getAll())
    // Enable egg interaction
    this.eggsUI?.setInteractiveSlots(true)
  }

  // End player turn: disable interaction and immediately start monster turn
  public endPlayerTurn(): void {
    // Disable egg interaction immediately
    this.eggsUI?.setInteractiveSlots(false)
    // Immediately start monster turn
    this.startMonsterTurn()
  }

  // Start monster turn: delegate to MonsterSystem (MonsterSystem owns the monster turn lifecycle)
  public startMonsterTurn(): void {
    this.monsterSystem.executeMonsterTurn()
  }

  // Finish monster turn: decide victory/defeat/next round (composition-root decisions only)
  public finishMonsterTurn(): void {
    // Decide victory / defeat / next round
    if (this.monsterSystem.isAllDead()) {
      this.handleVictory()
      return
    }

    if (this.playerRuntime.isDead()) {
      this.handleDefeat()
      return
    }

    // Otherwise start next player turn: clear old eggs and generate new ones
    this.startPlayerTurn()
  }

  // Handle victory: stop battle, disable input, append log, advance session level, reinitialize monsters and reset runtime, start next battle
  public handleVictory(): void {
    // Stop the battle timer
    this.battleSystem.stop()

    // disable player interactions
    this.eggsUI?.setInteractiveSlots(false)

    // append Victory to log
    this.appendLog('Victory')
    this.logPanel?.refresh(this.logs)

    // advance session level
    this.currentLevel += 1

    // load the next level and initialize monsters
    const nextLevel = ConfigManager.getLevel(this.currentLevel)
    const nextMonsters = ConfigManager.getMonsters(nextLevel.monsterPool)
    this.monsterSystem.initialize(nextMonsters)

    // reset player and eggs for next battle
    this.playerRuntime.reset()
    this.eggSystem.reset()

    // refresh UI for new level
    this.enemies?.refresh(this.monsterSystem.getAll())
    this.eggsUI?.refresh(this.eggSystem.getAll())
    const playerForUI = { ...this.playerConfig, currentHP: this.playerRuntime.getCurrentHp(), maxHP: this.playerRuntime.getMaxHp(), coin: this.playerRuntime.getCoins() }
    this.topUI?.refresh(playerForUI as any)
    this.playersUI?.refresh(playerForUI as any, this.petsConfig)

    // start next battle automatically by starting player turn
    this.startPlayerTurn()
  }

  // Handle defeat: stop battle, disable input, append log, reset session and runtime state, enable start button
  public handleDefeat(): void {
    // append Defeat to log and stop battle
    this.appendLog('Defeat')
    this.logPanel?.refresh(this.logs)

    this.battleSystem.stop()

    // disable interactions
    this.eggsUI?.setInteractiveSlots(false)

    // reset progression to level 1
    this.currentLevel = 1
    const level1 = ConfigManager.getLevel(this.currentLevel)
    const monstersLevel1 = ConfigManager.getMonsters(level1.monsterPool)
    this.monsterSystem.initialize(monstersLevel1)

    // reset runtime systems
    this.eggSystem.reset()
    this.playerRuntime.reset()

    // refresh UI
    this.enemies?.refresh(this.monsterSystem.getAll())
    this.eggsUI?.refresh(this.eggSystem.getAll())
    const playerForUI = { ...this.playerConfig, currentHP: this.playerRuntime.getCurrentHp(), maxHP: this.playerRuntime.getMaxHp(), coin: this.playerRuntime.getCoins() }
    this.topUI?.refresh(playerForUI as any)
    this.playersUI?.refresh(playerForUI as any, this.petsConfig)

    // enable start button for player to restart
    this.btn?.refresh({ label: 'START BATTLE', disabled: false })
  }

  // Restart battle (composition-root helper)
  public restartBattle(): void {
    // Start a new battle via the composition root. Runtime state is expected to be reset by handleDefeat.
    this.battleSystem.start()
  }

  private appendLog(message: string): void {
    this.logs.push(message)
    while (this.logs.length > 1000) this.logs.shift()
  }
}
