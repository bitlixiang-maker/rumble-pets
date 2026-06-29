// BattleState data structure
// Minimal serializable shape to represent an in-progress battle.
export interface BattleState {
  id: string
  levelId: string
  turn: number
  playerIds: string[]
  monsterIds: string[]
  logs: string[]
  status: 'pending' | 'running' | 'finished'
}
