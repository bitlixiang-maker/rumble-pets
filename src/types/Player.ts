// Player data structure (ID is number)
// Only basic player attributes are stored here (no pet/egg ownership lists).
export interface Player {
  id: number
  name?: string
  hp: number
  coins: number
  // optional per-player limits (sourced from game config)
  maxEggSlots?: number
}
