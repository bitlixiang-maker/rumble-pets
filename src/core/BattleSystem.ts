// BattleSystem: controls high-level turn phases and emits ticks only during PlayerTurn.
// Pure logic: no Phaser, no UI, no timers beyond update(delta) driven accumulation.

export type BattleEvent =
  | 'BattleStarted'
  | 'BattleTick'
  | 'BattleStopped'
  | 'BattleFinished'
  | 'PlayerTurnStarted'
  | 'MonsterTurnStarted'

export type BattleListener = (payload?: any) => void

type Phase = 'Idle' | 'PlayerTurn' | 'MonsterTurn' | 'Finished'

export default class BattleSystem {
  private running = false
  private phase: Phase = 'Idle'
  private timer = 0 // ms accumulator
  private tickInterval = 1000
  private tickCount = 0
  private listeners: Map<BattleEvent, Set<BattleListener>> = new Map()

  constructor(tickIntervalMs = 1000) {
    this.tickInterval = tickIntervalMs
  }

  on(event: BattleEvent, fn: BattleListener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
  }

  off(event: BattleEvent, fn: BattleListener) {
    this.listeners.get(event)?.delete(fn)
  }

  private emit(event: BattleEvent, payload?: any) {
    const set = this.listeners.get(event)
    if (!set) return
    for (const fn of Array.from(set)) {
      try {
        fn(payload)
      } catch (err) {
        // swallow listener errors
        // eslint-disable-next-line no-console
        console.error('BattleSystem listener error', err)
      }
    }
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.timer = 0
    this.tickCount = 0
    this.emit('BattleStarted')
    // Immediately begin PlayerTurn
    this.startPlayerTurn()
  }

  stop(): void {
    if (!this.running) return
    this.running = false
    this.phase = 'Finished'
    this.emit('BattleStopped')
    this.emit('BattleFinished')
  }

  // Called by scene each frame with delta milliseconds
  update(deltaMs: number): void {
    if (!this.running) return
    // Only emit ticks during PlayerTurn
    if (this.phase !== 'PlayerTurn') return

    this.timer += deltaMs
    while (this.timer >= this.tickInterval) {
      this.timer -= this.tickInterval
      this.tickCount += 1
      this.emit('BattleTick', this.tickCount)
    }
  }

  isRunning(): boolean {
    return this.running
  }

  // Phase control -------------------------------------------------
  startPlayerTurn(): void {
    if (!this.running) return
    this.phase = 'PlayerTurn'
    // reset tick accumulator for a fresh turn if desired
    this.timer = 0
    this.tickCount = 0
    this.emit('PlayerTurnStarted')
  }

  endPlayerTurn(): void {
    if (!this.running) return
    if (this.phase !== 'PlayerTurn') return
    // Transition to MonsterTurn
    this.phase = 'MonsterTurn'
    this.emit('MonsterTurnStarted')
  }
}
