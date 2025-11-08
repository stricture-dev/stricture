import type { InitOptions } from '../../types/cli.js'
import type { ArchPreset } from '@stricture/core'
import { detectProject } from './detect-project.js'
import { presetWizard } from './preset-wizard.js'
import { generateConfig, customizeBoundaries } from './generate-config.js'
import { updateEslintConfig } from './update-eslint.js'
import { installDependencies } from './install-deps.js'
import { loadPreset } from '../../utils/preset-registry.js'
import { logger } from '../../utils/logger.js'
import { createSpinner } from '../../utils/spinner.js'
import { promptConfirm } from '../../utils/prompts.js'

/**
 * Initialize Stricture in a project
 */
export async function init(options: InitOptions = {}): Promise<void> {
  const projectRoot = options.projectRoot || process.cwd()

  logger.log('')
  logger.heading('🏗️  Stricture Initialization')
  logger.log('')

  // 1. Detect project info
  let spinner = createSpinner('Analyzing project...').start()
  const projectInfo = await detectProject(projectRoot)
  spinner.succeed('Project analyzed')

  // 2. Interactive preset selection (if not provided)
  let presetId: string
  if (options.preset) {
    presetId = options.preset
    logger.info(`Using preset: ${presetId}`)
  } else if (options.yes) {
    // Use default preset in non-interactive mode
    presetId = '@stricture/hexagonal'
    logger.info(`Using default preset: ${presetId}`)
  } else {
    presetId = await presetWizard(projectInfo)
  }

  // 3. Load preset
  spinner = createSpinner('Loading preset...').start()
  let presetConfig: ArchPreset
  try {
    presetConfig = (await loadPreset(presetId)) as ArchPreset
    spinner.succeed(`Loaded preset: ${presetConfig.name}`)
  } catch (error) {
    spinner.fail('Failed to load preset')
    throw error
  }

  // 4. Customize boundaries based on project structure
  const boundaries = customizeBoundaries(
    presetConfig.boundaries,
    projectInfo.srcDirectory
  )

  // 5. Confirm with user (if interactive)
  if (options.interactive !== false && !options.yes) {
    logger.log('')
    logger.heading('Configuration Preview')
    logger.log('')
    logger.info(`Preset: ${presetConfig.name}`)
    logger.info(`Boundaries: ${boundaries.length}`)
    logger.log('')
    logger.dim('Boundaries:')
    for (const boundary of boundaries) {
      logger.dim(`  - ${boundary.name}: ${boundary.pattern}`)
    }
    logger.log('')

    const confirmed = await promptConfirm(
      'Does this configuration look correct?',
      true
    )

    if (!confirmed) {
      logger.warn('Initialization cancelled')
      return
    }
  }

  // 6. Create .stricture/config.json
  spinner = createSpinner('Creating configuration...').start()
  await generateConfig({
    root: projectRoot,
    preset: presetId,
    boundaries,
    rules: presetConfig.rules
  })
  spinner.succeed('Created .stricture/config.json')

  // 7. Update ESLint config
  spinner = createSpinner('Updating ESLint configuration...').start()
  await updateEslintConfig(projectRoot)
  spinner.succeed('Updated ESLint configuration')

  // 8. Install dependencies (if requested)
  if (options.install !== false) {
    const shouldInstall =
      options.install === true ||
      options.yes ||
      (await promptConfirm('Install required dependencies?', true))

    if (shouldInstall) {
      spinner = createSpinner('Installing dependencies...').start()
      try {
        await installDependencies(presetId, projectInfo.packageManager)
        spinner.succeed('Dependencies installed')
      } catch (error) {
        spinner.fail('Failed to install dependencies')
        logger.warn(
          `You can install them manually:\n  ${projectInfo.packageManager} ${
            projectInfo.packageManager === 'npm' ? 'install' : 'add'
          } -D @stricture/eslint-plugin ${presetId}`
        )
      }
    } else {
      logger.log('')
      logger.info('Skipping dependency installation')
      logger.dim(
        `Run manually: ${projectInfo.packageManager} ${
          projectInfo.packageManager === 'npm' ? 'install' : 'add'
        } -D @stricture/eslint-plugin ${presetId}`
      )
    }
  }

  // 9. Show next steps
  showNextSteps(presetId, options.install !== false)
}

/**
 * Show next steps after initialization
 */
function showNextSteps(preset: string, installed: boolean): void {
  logger.log('')
  logger.success('Stricture initialized successfully!')
  logger.log('')
  logger.heading('Next Steps:')
  logger.log('')

  if (!installed) {
    logger.log('1. Install dependencies:')
    logger.dim(`   npm install -D @stricture/eslint-plugin ${preset}`)
    logger.log('')
    logger.log('2. Run linting to check architecture:')
    logger.dim('   npm run lint')
    logger.log('')
  } else {
    logger.log('1. Run linting to check architecture:')
    logger.dim('   npm run lint')
    logger.log('')
    logger.log('2. Or use the Stricture CLI to check:')
    logger.dim('   npx stricture check')
    logger.log('')
  }

  logger.log('3. Customize your configuration:')
  logger.dim('   Edit .stricture/config.json')
  logger.log('')

  logger.dim('Learn more: https://stricture.dev/docs')
  logger.log('')
}
