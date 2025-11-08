import { spawn } from 'child_process'

/**
 * Install dependencies using the appropriate package manager
 */
export async function installDependencies(
  preset: string,
  packageManager: 'npm' | 'yarn' | 'pnpm'
): Promise<void> {
  const deps = [
    '@stricture/eslint-plugin',
    preset
  ]

  const args = getInstallArgs(packageManager, deps)

  return new Promise((resolve, reject) => {
    const proc = spawn(packageManager, args, {
      stdio: 'inherit',
      shell: true
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Installation failed with code ${code}`))
      }
    })

    proc.on('error', (error) => {
      reject(error)
    })
  })
}

/**
 * Get install arguments for package manager
 */
function getInstallArgs(
  packageManager: string,
  deps: string[]
): string[] {
  switch (packageManager) {
    case 'pnpm':
      return ['add', '-D', ...deps]
    case 'yarn':
      return ['add', '--dev', ...deps]
    case 'npm':
    default:
      return ['install', '--save-dev', ...deps]
  }
}
