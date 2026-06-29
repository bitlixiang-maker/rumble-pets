// Core configuration manager
// Purpose: central place to read runtime configuration (game settings,
// balance values, feature flags). Currently minimal — will be extended
// to support typed configs, hot-reload, and validation.

type GameConfig = {
  title?: string
  resolution?: {
    width: number
    height: number
  }
  [key: string]: any
}

let _config: GameConfig | null = null

export default class ConfigManager {
  // Initialize the manager with a parsed JSON object.
  static initialize(cfg: GameConfig) {
    _config = cfg
  }

  // Simple getter that supports dot paths like 'resolution.width'.
  static get<T = any>(key: string, fallback?: T): T | undefined {
    if (!_config) return fallback
    const parts = key.split('.')
    let cur: any = _config
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
      else return fallback
    }
    return cur as T
  }

  // Return the raw configuration object. Useful for editors or debug UI.
  static raw(): GameConfig | null {
    return _config
  }
}
