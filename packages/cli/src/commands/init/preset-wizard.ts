import type { ProjectInfo } from '../../types/cli.js'
import { promptPresetSelection } from '../../utils/prompts.js'
import {
  PRESET_REGISTRY,
  getRecommendedPresets
} from '../../utils/preset-registry.js'
import { logger } from '../../utils/logger.js'

/**
 * Interactive preset selection wizard
 */
export async function presetWizard(projectInfo: ProjectInfo): Promise<string> {
  // Show detected project info
  logger.log('')
  logger.heading('Project Detection')
  logger.log('')
  logger.info(
    `Framework: ${projectInfo.framework === 'unknown' ? 'Generic' : projectInfo.framework}`
  )
  logger.info(
    `TypeScript: ${projectInfo.hasTypeScript ? 'Enabled' : 'Not detected'}`
  )
  logger.info(`Package Manager: ${projectInfo.packageManager}`)
  logger.info(`Source Directory: ${projectInfo.srcDirectory}`)
  logger.log('')

  // Get recommended presets based on framework
  const recommended = getFrameworkRecommendations(projectInfo.framework)

  logger.heading('Recommended Presets')
  logger.log('')

  // Show recommendations
  for (const preset of recommended) {
    logger.log(`  ${preset.name}`)
    logger.dim(`  ${preset.description}`)
    logger.log('')
  }

  // Prompt for selection
  const allPresets = [...recommended, ...PRESET_REGISTRY.filter(
    (p) => !recommended.find((r) => r.id === p.id)
  )]

  const selected = await promptPresetSelection(allPresets)

  return selected
}

/**
 * Get framework-specific preset recommendations
 */
function getFrameworkRecommendations(
  framework?: string
): Array<{ id: string; name: string; description: string; installed: boolean }> {
  const base = getRecommendedPresets()

  switch (framework) {
    case 'nextjs':
      return [
        {
          id: '@stricture/nextjs',
          name: 'Next.js + Hexagonal',
          description: 'Best for domain-driven Next.js apps',
          installed: false
        },
        ...base
      ]

    case 'nestjs':
      return [
        {
          id: '@stricture/nestjs',
          name: 'NestJS + Layered',
          description: 'Best for traditional NestJS apps',
          installed: false
        },
        ...base
      ]

    default:
      return base
  }
}
