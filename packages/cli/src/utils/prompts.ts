import inquirer from 'inquirer'
import type { PresetInfo } from '../types/cli.js'

/**
 * Prompt user to select a preset
 */
export async function promptPresetSelection(
  presets: PresetInfo[]
): Promise<string> {
  const { preset } = await inquirer.prompt<{ preset: string }>([
    {
      type: 'list',
      name: 'preset',
      message: 'Which architecture preset do you want to use?',
      choices: presets.map((p) => ({
        name: `${p.name} - ${p.description}`,
        value: p.id,
        short: p.name
      }))
    }
  ])

  return preset
}

/**
 * Prompt user to confirm an action
 */
export async function promptConfirm(
  message: string,
  defaultValue = true
): Promise<boolean> {
  const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue
    }
  ])

  return confirmed
}

/**
 * Prompt user for text input
 */
export async function promptInput(
  message: string,
  defaultValue?: string
): Promise<string> {
  const { value } = await inquirer.prompt<{ value: string }>([
    {
      type: 'input',
      name: 'value',
      message,
      default: defaultValue
    }
  ])

  return value
}

/**
 * Prompt user to select from a list
 */
export async function promptSelect<T extends string>(
  message: string,
  choices: Array<{ name: string; value: T }>
): Promise<T> {
  const { selected } = await inquirer.prompt<{ selected: T }>([
    {
      type: 'list',
      name: 'selected',
      message,
      choices
    }
  ])

  return selected
}
