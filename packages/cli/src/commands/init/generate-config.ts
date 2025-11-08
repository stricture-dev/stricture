import path from 'path'
import type { StrictureConfig } from '@stricture/core'
import type { BoundaryDefinition, ArchRule } from '@stricture/core'
import { ensureDir, writeJsonFile } from '../../utils/file-utils.js'

/**
 * Generate .stricture/config.json
 */
export async function generateConfig(options: {
  root: string
  preset: string
  boundaries: BoundaryDefinition[]
  rules: ArchRule[]
}): Promise<void> {
  const { root, preset, boundaries, rules } = options

  const config: StrictureConfig = {
    version: '1',
    preset,
    boundaries,
    rules
  }

  // Ensure .stricture directory exists
  const strictureDir = path.join(root, '.stricture')
  await ensureDir(strictureDir)

  // Write config file
  const configPath = path.join(strictureDir, 'config.json')
  await writeJsonFile(configPath, config)
}

/**
 * Customize boundaries for the project
 */
export function customizeBoundaries(
  presetBoundaries: BoundaryDefinition[],
  srcDirectory: string
): BoundaryDefinition[] {
  // Replace 'src' in patterns with actual source directory
  return presetBoundaries.map((boundary) => ({
    ...boundary,
    pattern: boundary.pattern.replace(/^src\//, `${srcDirectory}/`)
  }))
}
