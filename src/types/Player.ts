// Player data structure
// Lightweight shape for player-related data. Contains only plain data fields.
export interface Player {
  id: string
  name: string
  hp: number
  coins: number
  // references to owned pets/eggs by ID
  petIds: string[]
  eggIds: string[]
  // optional: player-specific limits (sourced from game config)
  maxEggSlots?: number
}
