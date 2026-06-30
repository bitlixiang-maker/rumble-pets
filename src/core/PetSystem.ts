// PetSystem: pure logic owning pet runtime state and attack order during battle.
// Emits PetAttack events when a pet should attack. No Phaser, no UI.

import { Pet } from '../types'

export type PetEvent = 'PetAttack'
export type PetListener = (payload?: any) => void

export default class PetSystem {
  private initialConfigs: Pet[] = []
  private pets: (Pet & { alive: boolean })[] = []
  private listeners: Map<PetEvent, Set<PetListener>> = new Map()
  private index = 0

  initialize(configPets: Pet[]): void {
    this.initialConfigs = configPets.map(p => ({ ...p }))
    this.reset()
  }

  reset(): void {
    this.pets = this.initialConfigs.map(p => ({ ...p, alive: true }))
    this.index = 0
  }

  getAll(): Pet[] {
    return this.pets.map(p => ({ id: p.id, name: p.name, atk: p.atk, targetCount: p.targetCount, rarity: p.rarity }))
  }

  // Peek next alive attacker without advancing index
  getNextAttacker(): Pet | undefined {
    if (this.pets.length === 0) return undefined
    const len = this.pets.length
    for (let i = 0; i < len; i++) {
      const idx = (this.index + i) % len
      const p = this.pets[idx]
      if (p.alive) return { id: p.id, name: p.name, atk: p.atk, targetCount: p.targetCount, rarity: p.rarity }
    }
    return undefined
  }

  // Called by the scene on each BattleTick. PetSystem decides who attacks and emits PetAttack.
  onBattleTick(): void {
    const attackerIdx = this.findNextAliveIndex()
    if (attackerIdx === -1) return
    const p = this.pets[attackerIdx]
    const damage = p.atk
    // Advance index to the next slot after the attacker for round-robin
    this.index = (attackerIdx + 1) % this.pets.length
    this.emit('PetAttack', { pet: { id: p.id, name: p.name, atk: p.atk, targetCount: p.targetCount, rarity: p.rarity }, damage })
  }

  private findNextAliveIndex(): number {
    if (this.pets.length === 0) return -1
    const len = this.pets.length
    for (let i = 0; i < len; i++) {
      const idx = (this.index + i) % len
      if (this.pets[idx].alive) return idx
    }
    return -1
  }

  // allow external toggling alive flag if needed in future
  setAlive(petId: string, alive: boolean): void {
    const p = this.pets.find(x => x.id === petId)
    if (p) p.alive = alive
  }

  on(event: PetEvent, fn: PetListener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
  }

  off(event: PetEvent, fn: PetListener) {
    this.listeners.get(event)?.delete(fn)
  }

  private emit(event: PetEvent, payload?: any) {
    const set = this.listeners.get(event)
    if (!set) return
    for (const fn of Array.from(set)) {
      try {
        fn(payload)
      } catch (err) {
        // swallow listener errors
        // eslint-disable-next-line no-console
        console.error('PetSystem listener error', err)
      }
    }
  }
}
