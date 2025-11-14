import path from 'path'
import { promises as fs } from 'fs'
import type { DiagramOptions } from '../../types/cli.js'
import type { StrictureConfig } from '@stricture/core'
import { fileExists, readJsonFile } from '../../utils/file-utils.js'
import { generateMermaidDiagram } from './generate-mermaid.js'
import { generateAsciiDiagram } from './generate-ascii.js'
import { logger } from '../../utils/logger.js'

/**
 * Generate architecture diagram
 */
export async function diagram(
  options: DiagramOptions = {}
): Promise<void> {
  const projectRoot = process.cwd()
  const configPath =
    options.configPath ?? path.join(projectRoot, '.stricture/config.json')

  // Load config
  if (!(await fileExists(configPath))) {
    logger.error('Configuration file not found')
    logger.dim(`Run 'stricture init' to create configuration`)
    return
  }

  const config = await readJsonFile<StrictureConfig>(configPath)

  // Generate diagram based on format
  const format = options.format ?? 'mermaid'
  let diagramContent: string

  switch (format) {
    case 'mermaid':
      diagramContent = generateMermaidDiagram(config)
      break
    case 'ascii':
      diagramContent = generateAsciiDiagram(config)
      break
    case 'svg':
      logger.warn('SVG format not yet implemented, using Mermaid instead')
      diagramContent = generateMermaidDiagram(config)
      break
    default:
      logger.error(`Unknown format: ${format}`)
      return
  }

  // Output
  if (options.output) {
    await fs.writeFile(options.output, diagramContent, 'utf-8')
    logger.success(`Diagram saved to ${options.output}`)
  } else {
    console.log('')
    console.log(diagramContent)
    console.log('')
  }
}
