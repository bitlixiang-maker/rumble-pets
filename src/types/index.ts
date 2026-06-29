// Central types barrel and GameConfig definition.
// All config IDs use number.

export interface GameConfig {
  title?: string
  startHP: number
  startCoin: number
  maxEggSlots: number
  version: string
  resolution?: { width: number; height: number }
  [key: string]: any
}

export * from './Monster'
export * from './Pet'
export * from './Egg'
export * from './Player'
export * from './Level'
export * from './BattleState'
