// BattleSystem: pure logic that controls the battle timer only.
// Responsibilities:
// - start()
// - stop()
// - update(deltaMs)
// - isRunning()
// - emits events: BattleStarted, BattleTick, BattleStopped, BattleFinished

export type BattleEvent = 'BattleStarted' | 'BattleTick' | 'BattleStopped' | 'BattleFinished'
export type BattleListener = (payload?: any) => void

export default class BattleSystem {
  private running = false
  private timer = 0 // milliseconds accumulator
  private tickInterval = 1000 // ms per tick
  private tickCount = 0
  private listeners: Map<BattleEvent, Set<BattleListener>> = new Map()

  constructor(tickIntervalMs = 1000) {
    this.tickInterval = tickIntervalMs
  }

  // Event subscription
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
        // swallow listeners errors to avoid breaking the system
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
  }

  stop(): void {
    if (!this.running) return
    this.running = false
    this.emit('BattleStopped')
    this.emit('BattleFinished')
  }

  // update must be called regularly by the host (e.g., the game loop)
  // delta is expected in milliseconds
  update(deltaMs: number): void {
    if (!this.running) return
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
}
