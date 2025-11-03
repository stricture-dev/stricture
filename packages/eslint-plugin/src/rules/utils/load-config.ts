import fs from 'fs'
import path from 'path'
import type { StrictureConfig } from '@stricture/core'

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
 * This is a simple loader that:
 * 1. Reads the config file
 * 2. Parses JSON
 * 3. Caches the result based on file mtime
 * 4. Returns the config for use with @stricture/core
 *
 * Note: Does NOT validate the config - that's done by @stricture/core
 */
export function loadConfig(configPath: string): StrictureConfig {
  // Resolve to absolute path for consistent caching
  const absolutePath = path.resolve(configPath)

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
    let config: StrictureConfig
    try {
      config = JSON.parse(fileContent) as StrictureConfig
    } catch (parseErr) {
      throw new Error(
        `Failed to parse config at ${configPath}: ${parseErr instanceof Error ? parseErr.message : 'Invalid JSON'}`
      )
    }

    // Get file stats for caching
    const stats = fs.statSync(absolutePath)

    // Cache the config
    configCache.set(absolutePath, {
      config,
      mtime: stats.mtimeMs
    })

    return config
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
 * Clear the configuration cache
 * Useful for testing or when you want to force a reload
 */
export function clearConfigCache(): void {
  configCache.clear()
}
