// Pet data structure
// Mirrors src/config/pet.json
export interface Pet {
  id: string
  name: string
  element: string
  attack: number
  targetCount: number
  sprite?: string
}
