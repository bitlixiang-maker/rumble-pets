// Monster data structure
// Mirrors src/config/monster.json
export interface Monster {
  id: string
  name: string
  hp: number
  attack: number
  rewardCoin: number
  weakness?: string
  sprite?: string
}
