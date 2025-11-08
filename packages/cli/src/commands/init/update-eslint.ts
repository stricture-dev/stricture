import path from 'path'
import { fileExists, readJsonFile, writeJsonFile } from '../../utils/file-utils.js'
import { promises as fs } from 'fs'

/**
 * Update ESLint configuration to use Stricture plugin
 */
export async function updateEslintConfig(root: string): Promise<boolean> {
  // Check for various ESLint config formats
  const configFiles = [
    '.eslintrc.json',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    'eslint.config.js'
  ]

  for (const file of configFiles) {
    const filePath = path.join(root, file)
    if (await fileExists(filePath)) {
      if (file.endsWith('.json')) {
        await updateJsonConfig(filePath)
        return true
      } else if (file.endsWith('.js') || file.endsWith('.cjs')) {
        await updateJsConfig(filePath)
        return true
      }
      // Skip YAML for now (complex to parse/modify)
    }
  }

  // Check package.json eslintConfig
  const packageJsonPath = path.join(root, 'package.json')
  if (await fileExists(packageJsonPath)) {
    const packageJson = await readJsonFile<Record<string, unknown>>(
      packageJsonPath
    )
    if (packageJson['eslintConfig']) {
      await updatePackageJsonConfig(packageJsonPath, packageJson)
      return true
    }
  }

  // No config found, create .eslintrc.json
  await createDefaultConfig(root)
  return true
}

/**
 * Update JSON ESLint config
 */
async function updateJsonConfig(filePath: string): Promise<void> {
  const config = await readJsonFile<Record<string, unknown>>(filePath)

  // Add plugin
  if (!config['plugins']) {
    config['plugins'] = []
  }
  const plugins = config['plugins'] as string[]
  if (!plugins.includes('@stricture')) {
    plugins.push('@stricture')
  }

  // Add rule
  if (!config['rules']) {
    config['rules'] = {}
  }
  const rules = config['rules'] as Record<string, unknown>
  rules['@stricture/enforce-boundaries'] = 'error'

  await writeJsonFile(filePath, config)
}

/**
 * Update JS/CJS ESLint config (basic string manipulation)
 */
async function updateJsConfig(filePath: string): Promise<void> {
  let content = await fs.readFile(filePath, 'utf-8')

  // Check if @stricture plugin already exists
  if (content.includes('@stricture')) {
    return // Already configured
  }

  // Add plugin to plugins array
  if (content.includes('plugins:')) {
    content = content.replace(
      /plugins:\s*\[/,
      "plugins: ['@stricture', "
    )
  } else if (content.includes('module.exports')) {
    content = content.replace(
      /module\.exports\s*=\s*{/,
      "module.exports = {\n  plugins: ['@stricture'],"
    )
  }

  // Add rule
  if (content.includes('rules:')) {
    content = content.replace(
      /rules:\s*{/,
      "rules: {\n    '@stricture/enforce-boundaries': 'error',"
    )
  } else {
    content = content.replace(
      /module\.exports\s*=\s*{/,
      "module.exports = {\n  rules: {\n    '@stricture/enforce-boundaries': 'error'\n  },"
    )
  }

  await fs.writeFile(filePath, content, 'utf-8')
}

/**
 * Update package.json eslintConfig
 */
async function updatePackageJsonConfig(
  filePath: string,
  packageJson: Record<string, unknown>
): Promise<void> {
  const eslintConfig = packageJson['eslintConfig'] as Record<string, unknown>

  // Add plugin
  if (!eslintConfig['plugins']) {
    eslintConfig['plugins'] = []
  }
  const plugins = eslintConfig['plugins'] as string[]
  if (!plugins.includes('@stricture')) {
    plugins.push('@stricture')
  }

  // Add rule
  if (!eslintConfig['rules']) {
    eslintConfig['rules'] = {}
  }
  const rules = eslintConfig['rules'] as Record<string, unknown>
  rules['@stricture/enforce-boundaries'] = 'error'

  await writeJsonFile(filePath, packageJson)
}

/**
 * Create default .eslintrc.json
 */
async function createDefaultConfig(root: string): Promise<void> {
  const config = {
    plugins: ['@stricture'],
    rules: {
      '@stricture/enforce-boundaries': 'error'
    }
  }

  const configPath = path.join(root, '.eslintrc.json')
  await writeJsonFile(configPath, config)
}
