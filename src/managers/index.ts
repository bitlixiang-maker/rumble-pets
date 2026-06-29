// Re-export core managers for backwards compatibility with older imports.
// This file keeps the previous path (src/managers/*) functional while the
// codebase migrates to src/core/.

export { default as ConfigManager } from '../core/ConfigManager'
export { default as AssetManager } from '../core/AssetManager'
