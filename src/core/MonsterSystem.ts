// MonsterSystem: pure logic owning monster runtime state during battle.
// No Phaser, no UI. Emits events when monsters are updated, die, attack, or when monster turn finishes.

import { Monster } from '../types'

export type MonsterEvent = 'MonsterUpdated' | 'MonsterDead' | 'AllMonsterDead' | 'MonsterAttack' | 'MonsterTurnFinished'
export type MonsterListener = (payload?: any) => void

export default class MonsterSystem {
  private monsters: {
    id: string
    name: string
    hp: number
    maxHp: number
    attack: number
    alive: boolean
  }[] = []

  private initialConfigs: Monster[] = []
  private listeners: Map<MonsterEvent, Set<MonsterListener>> = new Map()

  // initialize with configuration monsters (do not mutate inputs)
  initialize(configMonsters: Monster[]): void {
    this.initialConfigs = configMonsters.map(m => ({ ...m }))
    this.reset()
  }

  reset(): void {
    // create runtime copies from initial configs
    this.monsters = this.initialConfigs.map(m => ({
      id: m.id,
      name: m.name,
      hp: m.hp ?? m.maxHp,
      maxHp: m.maxHp,
      attack: (m as any).attack ?? 10,
      alive: (m.hp ?? m.maxHp) > 0
    }))
  }

  getAll(): Monster[] {
    // return copies shaped like the existing Monster type (hp, maxHp)
    return this.monsters.map(m => ({ id: m.id, name: m.name, hp: m.hp, maxHp: m.maxHp }))
  }

  // Event subscription
  on(event: MonsterEvent, fn: MonsterListener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
  }

  off(event: MonsterEvent, fn: MonsterListener) {
    this.listeners.get(event)?.delete(fn)
  }

  private emit(event: MonsterEvent, payload?: any) {
    const set = this.listeners.get(event)
    if (!set) return
    for (const fn of Array.from(set)) {
      try {
        fn(payload)
      } catch (err) {
        // swallow listener errors
        // eslint-disable-next-line no-console
        console.error('MonsterSystem listener error', err)
      }
    }
  }

  // Apply damage to a monster by id
  damage(monsterId: string, value: number): void {
    const m = this.monsters.find(x => x.id === monsterId)
    if (!m) return

    const prevHp = m.hp
    m.hp = Math.max(0, m.hp - value)

    // Always emit MonsterUpdated with damage and current hp
    this.emit('MonsterUpdated', { id: m.id, name: m.name, damage: value, hp: m.hp })

    // If monster just died, emit MonsterDead
    if (m.hp === 0 && m.alive) {
      m.alive = false
      this.emit('MonsterDead', { id: m.id, name: m.name })
    } else if (m.hp > 0) {
      // Monster survived the hit and may counterattack in other flows
      this.emit('MonsterAttack', { monsterId: m.id, monsterName: m.name, damage: m.attack })
    }

    // If all monsters dead, emit AllMonsterDead
    if (this.isAllDead()) {
      this.emit('AllMonsterDead')
    }
  }

  // Called by BattleScene when a BattleTick occurs. MonsterSystem owns damage logic.
  onBattleTick(): void {
    // Find first alive monster
    const target = this.monsters.find(m => m.alive && m.hp > 0)
    if (!target) return
    // Fixed damage value 10 per spec
    this.damage(target.id, 10)
  }

  // Execute the monster turn: every alive monster attacks once.
  executeMonsterTurn(): void {
    for (const m of this.monsters) {
      if (m.alive && (m.hp ?? 0) > 0) {
        // Emit an attack event for the scene to apply to player
        this.emit('MonsterAttack', { monsterId: m.id, monsterName: m.name, damage: m.attack })
      }
    }
    // After all attacks are emitted, announce turn finished
    this.emit('MonsterTurnFinished')
  }

  isAllDead(): boolean {
    return this.monsters.every(m => m.hp <= 0 || !m.alive)
  }
}
