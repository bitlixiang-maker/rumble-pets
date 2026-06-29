// Level data structure
// Mirrors src/config/level.json
export interface Level {
  id: string
  monsterPool: string[]
  monsterWeights: number[]
  eggPool: string[]
  eggWeights: number[]
}
