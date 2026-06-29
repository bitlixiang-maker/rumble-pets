// Monster data structure (ID is number)
// Mirrors src/config/monster.json
export interface Monster {
  id: number
  name: string
  hp: number
  maxHP: number
  attack: number
  rewardCoin: number
  weakness?: string
  sprite?: string
}
