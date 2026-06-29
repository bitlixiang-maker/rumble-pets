// BattleState and BattleLog data structures
// BattleState now contains full, inlined Player, Monster[], Egg[] data

import { Player } from './Player'
import { Monster } from './Monster'
import { Egg } from './Egg'

export interface BattleLog {
  // ISO timestamp
  timestamp: string
  message: string
  // optional tag (e.g., 'damage', 'system')
  tag?: string
}

export interface BattleState {
  id: number
  levelId: number
  turn: number
  players: Player[]
  monsters: Monster[]
  eggs: Egg[]
  logs: BattleLog[]
  status: 'pending' | 'running' | 'finished'
}
