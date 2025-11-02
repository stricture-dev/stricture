# @stricture/cli - Technical Specification

## Overview

`@stricture/cli` is an interactive command-line interface tool that helps developers initialize, manage, and validate Stricture architecture enforcement in their projects. It provides commands for project setup, validation, visualization, and scaffolding.

## Responsibilities

- Provide interactive wizard for initializing Stricture (`init` command)
- Detect project type, framework, and structure automatically
- Generate `.stricture/config.json` based on chosen preset
- Update ESLint configuration to use Stricture plugin
- Validate configuration files (`validate` command)
- Check for architecture violations (`check` command)
- Generate architecture diagrams (`diagram` command)
- Scaffold directory structure (`scaffold` command)
- Provide helpful error messages and suggestions
- Support CI/CD integration

## API Surface

### CLI Commands

```typescript
// Main CLI entry point
stricture <command> [options]

// Commands:
- init [options]         # Initialize Stricture
- check [options]        # Check for violations
- fix [options]          # Auto-fix violations
- validate [options]     # Validate config
- diagram [options]      # Generate diagram
- scaffold [options]     # Generate directories
```

### Programmatic API

```typescript
// Main exports for programmatic usage
export {
  init,
  check,
  validate,
  diagram,
  scaffold,
  fix
}
```

### Types

```typescript
interface InitOptions {
  preset?: string              // Preset to use
  projectRoot?: string         // Project root directory
  yes?: boolean                // Accept defaults
  install?: boolean            // Install dependencies
  interactive?: boolean        // Interactive mode
}

interface CheckOptions {
  configPath?: string          // Config file path
  fix?: boolean                // Auto-fix violations
  format?: 'text' | 'json' | 'checkstyle'
  verbose?: boolean
}

interface ValidateOptions {
  configPath?: string
  verbose?: boolean
}

interface DiagramOptions {
  configPath?: string
  output?: string              // Output file path
  format?: 'mermaid' | 'svg' | 'ascii'
}

interface ScaffoldOptions {
  configPath?: string
  force?: boolean              // Overwrite existing files
  examples?: boolean           // Include example files
}

interface ProjectInfo {
  root: string
  framework?: 'nextjs' | 'nestjs' | 'react' | 'vue' | 'express' | 'unknown'
  hasTypeScript: boolean
  packageManager: 'npm' | 'yarn' | 'pnpm'
  srcDirectory: string
  structure: DirectoryStructure
}

interface DirectoryStructure {
  directories: string[]
  suggestedBoundaries: BoundaryDefinition[]
}

interface CheckResult {
  valid: boolean
  violations: Violation[]
  summary: {
    totalFiles: number
    filesChecked: number
    violationsFound: number
    boundariesDefined: number
    rulesLoaded: number
  }
}

interface Violation {
  file: string
  line: number
  column: number
  rule: ArchRule
  from: BoundaryDefinition
  to: BoundaryDefinition
  message: string
}
```

## Implementation Approach

### Key Files

```
packages/cli/
├── src/
│   ├── cli.ts                      // Main CLI entry point (commander)
│   ├── index.ts                    // Programmatic API exports
│   ├── commands/
│   │   ├── init/
│   │   │   ├── index.ts            // Init command
│   │   │   ├── detect-project.ts   // Project detection
│   │   │   ├── preset-wizard.ts    // Interactive preset selection
│   │   │   ├── generate-config.ts  // Generate .stricture/config.json
│   │   │   ├── update-eslint.ts    // Update ESLint config
│   │   │   └── install-deps.ts     // Install dependencies
│   │   ├── check/
│   │   │   ├── index.ts            // Check command
│   │   │   ├── scan-files.ts       // Scan project files
│   │   │   ├── validate-imports.ts // Validate each file
│   │   │   └── format-results.ts   // Format output
│   │   ├── validate/
│   │   │   └── index.ts            // Validate command
│   │   ├── diagram/
│   │   │   ├── index.ts            // Diagram command
│   │   │   ├── generate-mermaid.ts
│   │   │   ├── generate-svg.ts
│   │   │   └── generate-ascii.ts
│   │   ├── scaffold/
│   │   │   ├── index.ts            // Scaffold command
│   │   │   └── generate-structure.ts
│   │   └── fix/
│   │       ├── index.ts            // Fix command
│   │       └── apply-fixes.ts
│   ├── utils/
│   │   ├── logger.ts               // Colored logging (chalk)
│   │   ├── spinner.ts              // Progress spinner (ora)
│   │   ├── prompts.ts              // Interactive prompts (inquirer)
│   │   ├── file-utils.ts           // File system utilities
│   │   └── preset-registry.ts      // Available presets registry
│   └── types/
│       └── cli.ts                  // CLI-specific types
├── tests/
│   ├── commands/
│   │   ├── init.test.ts
│   │   ├── check.test.ts
│   │   └── validate.test.ts
│   └── fixtures/
│       └── sample-projects/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
└── SPEC.md
```

### Architecture

**Command pattern**:
- Each command is a separate module
- Shared utilities in `utils/`
- Commander.js for CLI parsing
- Inquirer for interactive prompts

**Layers**:
1. **CLI layer** (`cli.ts`) - Parses arguments, dispatches to commands
2. **Command layer** (`commands/`) - Implements command logic
3. **Utility layer** (`utils/`) - Reusable utilities
4. **Core layer** (`@stricture/core`) - Types and validation

### Algorithm/Logic

#### Init Command Flow

```typescript
async function init(options: InitOptions) {
  const spinner = ora('Analyzing project...').start()

  // 1. Detect project info
  const projectInfo = await detectProject(options.projectRoot)
  spinner.succeed('Project analyzed')

  // 2. Interactive preset selection (if not provided)
  let preset: string
  if (options.preset) {
    preset = options.preset
  } else {
    preset = await presetWizard(projectInfo)
  }

  // 3. Load preset
  const presetConfig = await loadPreset(preset)

  // 4. Generate boundaries based on project structure
  const boundaries = await generateBoundaries(
    presetConfig,
    projectInfo.structure
  )

  // 5. Confirm with user (if interactive)
  if (options.interactive) {
    const confirmed = await confirmBoundaries(boundaries)
    if (!confirmed) {
      // Allow editing
      boundaries = await editBoundaries(boundaries)
    }
  }

  // 6. Create .stricture/config.json
  spinner.start('Creating configuration...')
  await generateConfig({
    preset,
    boundaries,
    rules: presetConfig.rules
  })
  spinner.succeed('Created .stricture/config.json')

  // 7. Update ESLint config
  spinner.start('Updating ESLint configuration...')
  await updateEslintConfig(projectInfo.root)
  spinner.succeed('Updated .eslintrc.js')

  // 8. Install dependencies (if requested)
  if (options.install) {
    spinner.start('Installing dependencies...')
    await installDependencies(preset, projectInfo.packageManager)
    spinner.succeed('Dependencies installed')
  }

  // 9. Show next steps
  showNextSteps(preset, options.install)
}
```

#### Project Detection Algorithm

```typescript
async function detectProject(root: string): Promise<ProjectInfo> {
  const info: ProjectInfo = {
    root,
    hasTypeScript: false,
    packageManager: 'npm',
    srcDirectory: 'src',
    structure: { directories: [], suggestedBoundaries: [] }
  }

  // Check for package.json
  const packageJson = await readPackageJson(root)

  // Detect framework
  if (packageJson.dependencies?.['next']) {
    info.framework = 'nextjs'
  } else if (packageJson.dependencies?.['@nestjs/core']) {
    info.framework = 'nestjs'
  } else if (packageJson.dependencies?.['react']) {
    info.framework = 'react'
  } else if (packageJson.dependencies?.['vue']) {
    info.framework = 'vue'
  } else if (packageJson.dependencies?.['express']) {
    info.framework = 'express'
  }

  // Detect TypeScript
  info.hasTypeScript = await fileExists(path.join(root, 'tsconfig.json'))

  // Detect package manager
  if (await fileExists(path.join(root, 'pnpm-lock.yaml'))) {
    info.packageManager = 'pnpm'
  } else if (await fileExists(path.join(root, 'yarn.lock'))) {
    info.packageManager = 'yarn'
  }

  // Detect source directory
  for (const dir of ['src', 'app', 'lib']) {
    if (await directoryExists(path.join(root, dir))) {
      info.srcDirectory = dir
      break
    }
  }

  // Analyze directory structure
  info.structure = await analyzeStructure(root, info.srcDirectory)

  return info
}
```

#### Check Command Flow

```typescript
async function check(options: CheckOptions): Promise<CheckResult> {
  const spinner = ora('Loading configuration...').start()

  // 1. Load and validate config
  const config = await loadConfig(options.configPath)
  const validation = validateConfig(config)

  if (!validation.valid) {
    spinner.fail('Invalid configuration')
    logErrors(validation.errors)
    return { valid: false, violations: [], summary: {...} }
  }

  spinner.succeed('Configuration loaded')

  // 2. Scan project files
  spinner.start('Scanning files...')
  const files = await scanFiles(process.cwd(), config.ignorePatterns)
  spinner.succeed(`Scanned ${files.length} files`)

  // 3. Check each file
  spinner.start('Checking imports...')
  const violations: Violation[] = []

  for (const file of files) {
    const fileViolations = await checkFile(file, config)
    violations.push(...fileViolations)
  }

  spinner.stop()

  // 4. Format and display results
  if (violations.length === 0) {
    console.log(chalk.green('✓ No violations found!'))
  } else {
    console.log(chalk.red(`✗ ${violations.length} violations found:\n`))
    formatViolations(violations, options.format)
  }

  // 5. Return result
  return {
    valid: violations.length === 0,
    violations,
    summary: {
      totalFiles: files.length,
      filesChecked: files.length,
      violationsFound: violations.length,
      boundariesDefined: config.boundaries.length,
      rulesLoaded: config.rules.length
    }
  }
}
```

#### Diagram Generation Algorithm

```typescript
async function diagram(options: DiagramOptions) {
  // 1. Load config
  const config = await loadConfig(options.configPath)

  // 2. Generate diagram based on format
  let diagram: string

  switch (options.format) {
    case 'mermaid':
      diagram = generateMermaidDiagram(config)
      break
    case 'svg':
      diagram = await generateSvgDiagram(config)
      break
    case 'ascii':
      diagram = generateAsciiDiagram(config)
      break
  }

  // 3. Output
  if (options.output) {
    await fs.writeFile(options.output, diagram)
    console.log(chalk.green(`✓ Diagram saved to ${options.output}`))
  } else {
    console.log(diagram)
  }
}

function generateMermaidDiagram(config: StrictureConfig): string {
  const lines = ['graph TD']

  // Add nodes
  for (const boundary of config.boundaries) {
    lines.push(`  ${boundary.name}[${boundary.name}]`)
  }

  // Add edges from rules
  for (const rule of config.rules) {
    if (rule.allowed) {
      const from = getBoundaryName(rule.from, config)
      const to = getBoundaryName(rule.to, config)
      if (from && to) {
        lines.push(`  ${from} --> ${to}`)
      }
    }
  }

  return lines.join('\n')
}
```

## Dependencies

### Runtime Dependencies

- **@stricture/core** (workspace:*) - Core types and utilities
- **commander** (^11.1.0) - CLI framework
- **inquirer** (^9.2.0) - Interactive prompts
- **chalk** (^5.3.0) - Colored terminal output
- **ora** (^8.0.0) - Spinners/progress indicators
- **picocolors** (^1.0.0) - Fast colored output (fallback)

### Dev Dependencies

- **typescript** (^5.3.0)
- **tsup** (^8.0.0)
- **vitest** (^1.2.0)
- **@types/inquirer** (^9.0.0)
- **@stricture/typescript-config** (workspace:*)
- **@stricture/eslint-config** (workspace:*)

### Peer Dependencies

None

## Testing Strategy

### Unit Tests

1. **Project detection**
   - Detects frameworks correctly
   - Detects package managers
   - Finds source directories
   - Analyzes structure accurately

2. **Config generation**
   - Generates valid JSON
   - Includes all required fields
   - Merges preset correctly
   - Handles custom boundaries

3. **File scanning**
   - Finds all relevant files
   - Respects ignore patterns
   - Handles large projects efficiently

4. **Violation detection**
   - Identifies violations correctly
   - Reports accurate line numbers
   - Formats messages properly

### Integration Tests

Test complete command flows:

```typescript
describe('init command', () => {
  it('should initialize hexagonal architecture', async () => {
    const tmpDir = await createTempProject()

    await init({
      projectRoot: tmpDir,
      preset: '@stricture/hexagonal',
      yes: true,
      install: false
    })

    // Assert config created
    const config = await readConfig(path.join(tmpDir, '.stricture/config.json'))
    expect(config.preset).toBe('@stricture/hexagonal')

    // Assert ESLint updated
    const eslintConfig = await readEslintConfig(tmpDir)
    expect(eslintConfig.plugins).toContain('@stricture')
  })
})
```

### E2E Tests

Test with real project fixtures:

```
tests/fixtures/
├── nextjs-project/
├── nestjs-project/
└── react-project/
```

### Test Files

```
tests/
├── commands/
│   ├── init.test.ts
│   ├── check.test.ts
│   ├── validate.test.ts
│   ├── diagram.test.ts
│   └── scaffold.test.ts
├── utils/
│   ├── detect-project.test.ts
│   ├── generate-config.test.ts
│   └── preset-wizard.test.ts
├── integration/
│   └── full-workflow.test.ts
└── fixtures/
    └── sample-projects/
```

## Configuration

### Build Configuration (tsup.config.ts)

```typescript
import { defineConfig } from 'tsup'

export default defineConfig([
  // Main library
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true
  },
  // CLI binary
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    clean: false,
    // Add shebang for executable
    banner: {
      js: '#!/usr/bin/env node'
    }
  }
])
```

### TypeScript Configuration

```json
{
  "extends": "@stricture/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Command Options

See API Surface section for detailed options per command.

## Error Handling

### User Errors

- **Missing config**: Suggest running `stricture init`
- **Invalid preset**: Show available presets
- **File not found**: Show clear path error
- **Permission denied**: Suggest using sudo (or checking permissions)

### System Errors

- **Network errors**: When installing dependencies
- **File system errors**: When reading/writing files
- **Parse errors**: When reading JSON/configs

### Error Reporting Strategy

```typescript
try {
  await command()
} catch (error) {
  if (error instanceof UserError) {
    console.error(chalk.red('Error:'), error.message)
    console.log(chalk.gray('\nSuggestion:'), error.suggestion)
    process.exit(1)
  } else {
    console.error(chalk.red('Unexpected error:'), error)
    console.log(chalk.gray('\nPlease report this issue at: https://github.com/stricture-dev/stricture/issues'))
    process.exit(1)
  }
}
```

## Performance Considerations

### File Scanning

- Use streaming for large projects
- Parallel file processing
- Skip node_modules, .git, etc.
- Respect .gitignore patterns

### Configuration Loading

- Cache loaded configs
- Lazy load presets
- Minimize file system operations

### User Experience

- Show progress spinners for long operations
- Provide percentage indicators
- Allow cancellation (Ctrl+C)
- Fast startup time (< 500ms)

### Targets

- **Startup time**: < 500ms
- **Init command**: < 5s for average project
- **Check command**: < 10s for 1000 files
- **Memory usage**: < 100MB

## Future Enhancements

(Out of scope for v1)

1. **Interactive Fixer**
   - Show violation
   - Suggest fixes
   - Apply interactively

2. **Migration Tool**
   - Migrate from other tools
   - Upgrade configs between versions
   - Refactor code to match boundaries

3. **Analytics**
   - Track violation trends
   - Show improvement over time
   - Generate reports

4. **AI-Powered**
   - Suggest boundaries from code analysis
   - Auto-generate rules
   - Explain violations in natural language

5. **Watch Mode**
   - Live checking during development
   - Desktop notifications
   - IDE integration

6. **Multi-Project**
   - Manage multiple projects
   - Share configs across projects
   - Monorepo support

7. **Cloud Features**
   - Store configs in cloud
   - Team sharing
   - Collaborative editing
