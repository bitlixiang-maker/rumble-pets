// ConfigManager: central loader and accessor for JSON configuration.
// BattleScene must not import JSON directly; always call ConfigManager.

import { Monster, Pet, Egg, Player, LevelConfig } from '../types'

export default class ConfigManager {
  private static initialized = false
  private static monsters: Record<string, Monster> = {}
  private static pets: Pet[] = []
  private static eggs: Egg[] = []
  private static levels: Record<number, LevelConfig> = {}
  private static game: { player: { id: string; coin: number }; currentLevel: number; timer: string } | null = null

  private constructor() {}

  // Load all JSON configuration files. Must be called before getters are used.
  static async initialize(): Promise<void> {
    if (ConfigManager.initialized) return

    try {
      const gameMod = await import('../config/game.json')
      const monsterMod = await import('../config/monster.json')
      const petMod = await import('../config/pet.json')
      const eggMod = await import('../config/egg.json')
      const levelMod = await import('../config/level.json')

      ConfigManager.game = gameMod.default

      const monsterList: Monster[] = monsterMod.default.monsters ?? []
      monsterList.forEach(m => {
        ConfigManager.monsters[m.id] = { ...m, hp: m.maxHp }
      })

      ConfigManager.pets = petMod.default.pets ?? []
      ConfigManager.eggs = eggMod.default.eggs ?? []

      const levels: LevelConfig[] = levelMod.default.levels ?? []
      levels.forEach(l => {
        ConfigManager.levels[l.level] = l
      })

      ConfigManager.initialized = true
    } catch (err) {
      // Let the caller handle initialization failure; rethrow for visibility
      throw new Error(`ConfigManager failed to initialize: ${err}`)
    }
  }

  static ensureInitialized(): void {
    if (!ConfigManager.initialized) {
      throw new Error('ConfigManager not initialized. Call initialize() before using getters.')
    }
  }

  static getLevel(levelNumber: number): LevelConfig {
    ConfigManager.ensureInitialized()
    const level = ConfigManager.levels[levelNumber]
    if (!level) throw new Error(`Level ${levelNumber} not found in configuration`)
    return { ...level }
  }

  static getMonsters(ids: string[]): Monster[] {
    ConfigManager.ensureInitialized()
    return ids.map(id => {
      const m = ConfigManager.monsters[id]
      if (!m) throw new Error(`Monster ${id} not found`) 
      // return a shallow copy so UI can show current hp separately
      return { id: m.id, name: m.name, maxHp: m.maxHp, hp: m.hp }
    })
  }

  static getPlayer(): Player {
    ConfigManager.ensureInitialized()
    if (!ConfigManager.game) throw new Error('Game configuration missing')
    const lvl = ConfigManager.levels[ConfigManager.game.currentLevel]
    if (!lvl) throw new Error('Current level configuration missing')

    const waveStr = `${lvl.wave}/${lvl.waveCount}`
    return {
      id: ConfigManager.game.player.id,
      coin: ConfigManager.game.player.coin,
      level: lvl.level,
      wave: waveStr,
      timer: ConfigManager.game.timer
    }
  }

  static getPets(): Pet[] {
    ConfigManager.ensureInitialized()
    // return a copy
    return ConfigManager.pets.map(p => ({ ...p }))
  }

  static getEggs(): Egg[] {
    ConfigManager.ensureInitialized()
    return ConfigManager.eggs.map(e => ({ ...e }))
  }
}
