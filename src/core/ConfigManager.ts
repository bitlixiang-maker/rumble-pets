// Core managers: skeleton implementations for future expansion.
// These are intentionally minimal so the project builds and is easy to extend.

/**
 * ConfigManager
 * - Responsible for loading and providing access to game configuration data.
 * - Keep methods static for easy global access. In future, this can be
 *   replaced with dependency injection if desired.
 */
export default class ConfigManager {
  private constructor() {}

  // Initialize configuration (e.g., load JSON files). Placeholder for now.
  static async initialize(): Promise<void> {
    // TODO: load config files into memory
    return Promise.resolve()
  }

  // Example getter stub
  static get(key: string): unknown {
    // TODO: return configuration value by key
    return undefined
  }
}
