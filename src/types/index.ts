// Domain types for configuration-driven UI
export interface Monster {
  id: string
  name: string
  hp?: number
  maxHp: number
}

export interface Pet {
  id: string
  name: string
  atk: number
  targetCount: number
  rarity: string
}

export interface Egg {
  id: string
  cost: number
}

export interface Player {
  id: string
  coin: number
  level: number
  wave: string
  timer: string
}

export interface LevelConfig {
  id: number
  level: number
  wave: number
  waveCount: number
  monsterPool: string[]
}
