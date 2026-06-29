// ConfigManager: loads JSON config files at runtime and provides typed accessors.
// Updated to use numeric IDs (Map<number, ...>) and new typed interfaces.

import { GameConfig, Monster, Pet, Egg, Level } from '../types'

export default class ConfigManager {
  private static game: GameConfig | null = null
  private static monsters: Map<number, Monster> = new Map()
  private static pets: Map<number, Pet> = new Map()
  private static eggs: Map<number, Egg> = new Map()
  private static levels: Map<number, Level> = new Map()

  // Initialize with an optional pre-loaded game config object.
  static async initialize(preloadedGameConfig?: any): Promise<void> {
    if (preloadedGameConfig) {
      ConfigManager.game = preloadedGameConfig as GameConfig
    } else {
      const g = await ConfigManager.fetchJson('/src/config/game.json')
      ConfigManager.game = g as GameConfig
    }

    const [monsters, pets, eggs, levels] = await Promise.all([
      ConfigManager.fetchJson('/src/config/monster.json'),
      ConfigManager.fetchJson('/src/config/pet.json'),
      ConfigManager.fetchJson('/src/config/egg.json'),
      ConfigManager.fetchJson('/src/config/level.json')
    ])

    if (Array.isArray(monsters)) {
      for (const m of monsters as Monster[]) {
        if (typeof m.id === 'number') ConfigManager.monsters.set(m.id, m)
      }
    }

    if (Array.isArray(pets)) {
      for (const p of pets as Pet[]) {
        if (typeof p.id === 'number') ConfigManager.pets.set(p.id, p)
      }
    }

    if (Array.isArray(eggs)) {
      for (const e of eggs as Egg[]) {
        if (typeof e.id === 'number') ConfigManager.eggs.set(e.id, e)
      }
    }

    if (Array.isArray(levels)) {
      for (const l of levels as Level[]) {
        if (typeof l.id === 'number') ConfigManager.levels.set(l.id, l)
      }
    }
  }

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

  static getGameConfig(): GameConfig | null {
    return ConfigManager.game
  }

  static getMonster(id: number): Monster | undefined {
    return ConfigManager.monsters.get(id)
  }

  static getPet(id: number): Pet | undefined {
    return ConfigManager.pets.get(id)
  }

  static getEgg(id: number): Egg | undefined {
    return ConfigManager.eggs.get(id)
  }

  static getLevel(id: number): Level | undefined {
    return ConfigManager.levels.get(id)
  }
}
