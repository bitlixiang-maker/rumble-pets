// Level data structure (ID is number)
// Mirrors src/config/level.json
export interface Level {
  id: number
  monsterPool: number[]
  monsterWeights: number[]
  eggPool: number[]
  eggWeights: number[]
}
