// Player runtime: pure logic for player HP and coins. No Phaser, no UI.

export type PlayerEvent = 'PlayerUpdated' | 'PlayerDead' | 'CoinsChanged' | 'CoinsNotEnough'
export type PlayerListener = (payload?: any) => void

export default class PlayerRuntime {
  private id: string
  private hp: number
  private maxHp: number
  private coins: number
  private listeners: Map<PlayerEvent, Set<PlayerListener>> = new Map()

  constructor(id: string, maxHp: number, hp?: number, coins = 0) {
    this.id = id
    this.maxHp = maxHp
    this.hp = hp !== undefined ? hp : maxHp
    this.coins = coins
  }

  getCurrentHp(): number {
    return this.hp
  }

  getMaxHp(): number {
    return this.maxHp
  }

  getCoins(): number {
    return this.coins
  }

  // Apply damage, emit PlayerUpdated and PlayerDead if died
  damage(value: number): void {
    const prev = this.hp
    this.hp = Math.max(0, this.hp - value)
    const dmg = prev - this.hp
    this.emit('PlayerUpdated', { id: this.id, damage: dmg, hp: this.hp, maxHp: this.maxHp })
    if (this.hp === 0) {
      this.emit('PlayerDead', { id: this.id })
    }
  }

  // Heal player by value, clamp to max HP, emit PlayerUpdated
  heal(value: number): void {
    const prev = this.hp
    this.hp = Math.min(this.maxHp, this.hp + value)
    const healed = this.hp - prev
    this.emit('PlayerUpdated', { id: this.id, healed, hp: this.hp, maxHp: this.maxHp })
  }

  isDead(): boolean {
    return this.hp <= 0
  }

  // Coins API
  canSpendCoins(cost: number): boolean {
    return this.coins >= cost
  }

  // Attempts to spend coins. Returns true if spent, false otherwise.
  spendCoins(cost: number): boolean {
    if (this.coins >= cost) {
      this.coins -= cost
      this.emit('CoinsChanged', { coins: this.coins })
      return true
    }
    this.emit('CoinsNotEnough', { requested: cost, coins: this.coins })
    return false
  }

  // Increase coins and emit CoinsChanged
  gainCoin(value: number): void {
    this.coins += value
    this.emit('CoinsChanged', { coins: this.coins })
  }

  on(event: PlayerEvent, fn: PlayerListener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
  }

  off(event: PlayerEvent, fn: PlayerListener) {
    this.listeners.get(event)?.delete(fn)
  }

  private emit(event: PlayerEvent, payload?: any) {
    const set = this.listeners.get(event)
    if (!set) return
    for (const fn of Array.from(set)) {
      try {
        fn(payload)
      } catch (err) {
        // swallow listener errors
        // eslint-disable-next-line no-console
        console.error('PlayerRuntime listener error', err)
      }
    }
  }
}
