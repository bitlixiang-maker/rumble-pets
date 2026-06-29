// Lightweight types used across systems and scenes. Keep types small
// and focused; add more granular types as systems are implemented.

export type ID = string

export interface GameConfig {
  title?: string
  resolution?: { width: number; height: number }
}
