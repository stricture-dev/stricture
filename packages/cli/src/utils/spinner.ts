import ora, { type Ora } from 'ora'

/**
 * Create a new spinner
 */
export function createSpinner(text: string): Ora {
  return ora(text)
}

/**
 * Run an async operation with a spinner
 */
export async function withSpinner<T>(
  text: string,
  operation: () => Promise<T>
): Promise<T> {
  const spinner = ora(text).start()
  try {
    const result = await operation()
    spinner.succeed()
    return result
  } catch (error) {
    spinner.fail()
    throw error
  }
}
