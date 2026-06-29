// Egg data structure (ID is number)
// Mirrors src/config/egg.json
export interface Egg {
  id: number
  cost: number
  possiblePets: number[]
  weights: number[]
}
