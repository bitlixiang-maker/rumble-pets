// ConfigManager: loads JSON config files at runtime and provides typed accessors.
// Responsibilities:
// - Load all JSON files from /src/config
// - Provide getters: getGameConfig(), getMonster(id), getPet(id), getEgg(id), getLevel(id)

import { GameConfig as GConfigType, Monster, Pet, Egg, Level } from '../types'

type RawMonster = Monster

export default class ConfigManager {
  private static game: GConfigType | null = null
  private static monsters: Map<string, Monster> = new Map()
  private static pets: Map<string, Pet> = new Map()
  private static eggs: Map<string, Egg> = new Map()
  private static levels: Map<string, Level> = new Map()

  // Initialize with an optional pre-loaded game config object.
  // This method will fetch the remaining JSON files from the config folder.
  // Use (window as any).fetch to avoid depending on DOM libs for TypeScript.
  static async initialize(preloadedGameConfig?: any): Promise<void> {
    if (preloadedGameConfig) {
      ConfigManager.game = preloadedGameConfig as GConfigType
    } else {
      const g = await ConfigManager.fetchJson('/src/config/game.json')
      ConfigManager.game = g as GConfigType
    }

    // Load other config files in parallel
    const [monsters, pets, eggs, levels] = await Promise.all([
      ConfigManager.fetchJson('/src/config/monster.json'),
      ConfigManager.fetchJson('/src/config/pet.json'),
      ConfigManager.fetchJson('/src/config/egg.json'),
      ConfigManager.fetchJson('/src/config/level.json')
    ])

    // Populate maps with typed objects
    if (Array.isArray(monsters)) {
      for (const m of monsters as RawMonster[]) ConfigManager.monsters.set(m.id, m)
    }

    if (Array.isArray(pets)) {
      for (const p of (pets as Pet[])) ConfigManager.pets.set(p.id, p)
    }

    if (Array.isArray(eggs)) {
      for (const e of (eggs as Egg[])) ConfigManager.eggs.set(e.id, e)
    }

    if (Array.isArray(levels)) {
      for (const l of (levels as Level[])) ConfigManager.levels.set(l.id, l)
    }
  }

  // Helper to fetch and parse JSON with a safe fallback.
  private static async fetchJson(path: string): Promise<any> {
    try {
      const resp = await (window as any).fetch(path)
      if (!resp.ok) {
        console.warn(`ConfigManager: failed to fetch ${path} - ${resp.status}`)
        return null
      }
      return await resp.json()
    } catch (err) {
      console.warn(`ConfigManager: error fetching ${path}`, err)
      return null
    }
  }

  // Typed accessors
  static getGameConfig(): GConfigType | null {
    return ConfigManager.game
  }

  static getMonster(id: string): Monster | undefined {
    return ConfigManager.monsters.get(id)
  }

  static getPet(id: string): Pet | undefined {
    return ConfigManager.pets.get(id)
  }

  static getEgg(id: string): Egg | undefined {
    return ConfigManager.eggs.get(id)
  }

  static getLevel(id: string): Level | undefined {
    return ConfigManager.levels.get(id)
  }
}
