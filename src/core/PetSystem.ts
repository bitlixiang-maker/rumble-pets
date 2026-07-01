import { Pet } from '../types'

export type PetEvent = 'PetAttack' | 'PetRolled' | 'PetExecuted'
export type PetListener = (payload?: any) => void

export interface RuntimePet {
  petId: number
  name: string
  rarity: string
  attack: number
  targetCount: number
  effectType: string
}

export default class PetSystem {
  private initialConfigs: Pet[] = []
  private pets: (Pet & { alive: boolean })[] = []
  private listeners: Map<PetEvent, Set<PetListener>> = new Map()
  private index = 0

  // eggDefsMap: numeric eggId -> egg definition object (may contain possiblePets and weights)
  private eggDefsMap: Record<number, any> = {}

  initialize(configPets: Pet[], eggDefsMap?: Record<number, any>): void {
    this.initialConfigs = configPets.map(p => ({ ...p }))
    this.reset()
    if (eggDefsMap) this.eggDefsMap = { ...eggDefsMap }
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

  // roll a pet from a runtimeEgg. Egg definition must be present in eggDefsMap
  // and then execute its effect immediately based on provided monster list.
  // monsters: array of Monster objects (from MonsterSystem.getAll())
  executeFromEgg(runtimeEgg: { slotIndex: number; eggId: number; cost: number; opened: boolean }, monsters: { id: string; name: string; hp?: number; maxHp: number }[]): void {
    const eggDef = this.eggDefsMap[runtimeEgg.eggId]
    if (!eggDef) return

    const possiblePets: string[] = Array.isArray((eggDef as any).possiblePets) ? (eggDef as any).possiblePets.slice() : []
    let weights: number[] = []

    if (Array.isArray((eggDef as any).weights) && (eggDef as any).weights.length === possiblePets.length) {
      weights = (eggDef as any).weights.map((w: any) => Number(w) || 1)
    } else if ((eggDef as any).weights && typeof (eggDef as any).weights === 'object') {
      weights = possiblePets.map((id: string) => Number(((eggDef as any).weights as any)[id]) || 1)
    } else {
      weights = possiblePets.map(() => 1)
    }

    // Map possiblePets (string ids) to pet configs in initialConfigs
    const candidates = possiblePets
      .map((pid, idx) => {
        const petCfg = this.initialConfigs.find(p => p.id === pid)
        if (!petCfg) return null
        return { petCfg, weight: weights[idx] }
      })
      .filter(Boolean) as { petCfg: Pet; weight: number }[]

    if (candidates.length === 0) return

    // Weighted random selection
    let total = 0
    const cum: number[] = []
    for (let i = 0; i < candidates.length; i++) {
      total += Math.max(0, candidates[i].weight)
      cum.push(total)
    }
    const r = Math.random() * total
    let chosen = candidates[candidates.length - 1]!.petCfg
    for (let i = 0; i < cum.length; i++) {
      if (r < cum[i]) {
        chosen = candidates[i]!.petCfg
        break
      }
    }

    // Build RuntimePet
    const petIndex = this.initialConfigs.findIndex(p => p.id === chosen.id)
    const numericId = petIndex >= 0 ? petIndex + 1 : 0
    const runtimePet: RuntimePet = {
      petId: numericId,
      name: chosen.name,
      rarity: (chosen as any).rarity ?? 'common',
      attack: (chosen as any).atk ?? (chosen as any).attack ?? 0,
      targetCount: (chosen as any).targetCount ?? 1,
      effectType: (chosen as any).effectType ?? 'Attack'
    }

    // Execute effect: choose targets for Attack based on targetCount
    if (runtimePet.effectType === 'Attack') {
      const targets: string[] = []
      for (const m of monsters) {
        if ((m.hp ?? 0) > 0) {
          targets.push(m.id)
          if (targets.length >= runtimePet.targetCount) break
        }
      }
      const value = runtimePet.attack
      this.emit('PetExecuted', { petName: runtimePet.name, effectType: 'Attack', targets, value })
    } else if (runtimePet.effectType === 'HealHP') {
      const value = runtimePet.attack // assume heal value uses attack field or specific heal value
      this.emit('PetExecuted', { petName: runtimePet.name, effectType: 'HealHP', value })
    } else if (runtimePet.effectType === 'GainCoin') {
      const value = runtimePet.attack // use attack as coin value unless egg/pet config provides value
      this.emit('PetExecuted', { petName: runtimePet.name, effectType: 'GainCoin', value })
    } else {
      // default: no-op
      this.emit('PetExecuted', { petName: runtimePet.name, effectType: runtimePet.effectType, value: 0 })
    }
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
