import fs from 'fs'
import path from 'path'
import type { StrictureConfig, ArchPreset } from '@stricture/core'
import { resolveConfig } from '@stricture/core'

/**
 * Cache for loaded configurations
 * Maps absolute config path to config object and file modification time
 */
interface ConfigCacheEntry {
  config: StrictureConfig
  mtime: number
}

const configCache = new Map<string, ConfigCacheEntry>()

/**
 * Load and parse .stricture/config.json
 *
 * This loader:
 * 1. Reads the config file
 * 2. Parses JSON
 * 3. Resolves presets (if specified)
 * 4. Merges preset boundaries and rules into config
 * 5. Caches the result based on file mtime
 * 6. Returns the resolved config for use with @stricture/core
 */
export function loadConfig(configPath: string): StrictureConfig {
  // Resolve to absolute path for consistent caching
  const absolutePath = path.resolve(configPath)

  // Get the directory of the config file (where node_modules should be)
  const configDir = path.dirname(absolutePath)

  // Check cache first
  const cached = configCache.get(absolutePath)

  if (cached) {
    // Check if file has been modified since we cached it
    try {
      const stats = fs.statSync(absolutePath)
      if (stats.mtimeMs === cached.mtime) {
        // File unchanged, return cached config
        return cached.config
      }
    } catch (err) {
      // File might have been deleted, clear cache and try to load
      configCache.delete(absolutePath)
    }
  }

  // Load config file
  try {
    const fileContent = fs.readFileSync(absolutePath, 'utf-8')

    // Parse JSON
    let rawConfig: StrictureConfig
    try {
      rawConfig = JSON.parse(fileContent) as StrictureConfig
    } catch (parseErr) {
      throw new Error(
        `Failed to parse config at ${configPath}: ${parseErr instanceof Error ? parseErr.message : 'Invalid JSON'}`
      )
    }

    // Resolve preset if specified
    let resolvedConfig: StrictureConfig
    if (rawConfig.preset) {
      // Load the preset package from the config directory
      const preset = loadPreset(rawConfig.preset, configDir)

      // Create preset map
      const presets = new Map<string, ArchPreset>()
      presets.set(rawConfig.preset, preset)

      // Load extended presets if specified
      if (rawConfig.extends) {
        for (const extendName of rawConfig.extends) {
          const extendPreset = loadPreset(extendName, configDir)
          presets.set(extendName, extendPreset)
        }
      }

      // Resolve config with preset
      resolvedConfig = resolveConfig(rawConfig, presets)
    } else {
      // No preset, use raw config
      resolvedConfig = rawConfig
    }

    // Get file stats for caching
    const stats = fs.statSync(absolutePath)

    // Cache the resolved config
    configCache.set(absolutePath, {
      config: resolvedConfig,
      mtime: stats.mtimeMs
    })

    return resolvedConfig
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `Config file not found: ${configPath}\n` +
        `Hint: Run 'npx stricture init' to create a config file`
      )
    }
    throw err
  }
}

/**
 * Load a preset package by name from a specific directory
 */
function loadPreset(presetName: string, fromDir: string): ArchPreset {
  try {
    // Resolve the preset module from the config directory
    // Go up one level from .stricture to the project root
    const projectRoot = path.dirname(fromDir)
    const resolvedPath = require.resolve(presetName, {
      paths: [projectRoot, fromDir]
    })

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const presetModule = require(resolvedPath)

    // Get the default export or named export
    const preset = presetModule.default ?? presetModule.hexagonalPreset ?? presetModule

    if (!preset?.boundaries || !preset?.rules) {
      throw new Error(`Invalid preset: ${presetName} does not export boundaries and rules`)
    }

    return preset as ArchPreset
  } catch (err) {
    throw new Error(
      `Failed to load preset '${presetName}': ${err instanceof Error ? err.message : String(err)}\n` +
      `Make sure the preset package is installed: npm install ${presetName}`
    )
  }
}

/**
 * Clear the configuration cache
 * Useful for testing or when you want to force a reload
 */
export function clearConfigCache(): void {
  configCache.clear()
}
