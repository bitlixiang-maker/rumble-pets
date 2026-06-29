// Pet data structure (ID is number)
// Mirrors src/config/pet.json
export interface Pet {
  id: number
  name: string
  element: string
  attack: number
  targetCount: number
  rarity: number
  cost: number
  sprite?: string
}
