# Development Guidelines for AI-Assisted Development

This document provides guidelines for AI assistants (Claude, etc.) working on the Stricture codebase.

## Core Principle: Documentation-Driven Development

**All code and tests MUST be in sync with README.md and SPEC.md at all times.**

Each package contains:
- **README.md** - User-facing documentation, examples, and API usage
- **SPEC.md** - Technical specification, implementation details, and architecture decisions
- **src/** - Implementation code
- **tests/** - Comprehensive test suite

These files form a contract. When one changes, all others must be updated accordingly.

## Development Workflow

Follow this workflow strictly for all changes:

### 1. Update Specification & Documentation

**Before writing any code:**

- Update **SPEC.md** with technical specifications
  - Architecture decisions
  - Implementation details
  - API contracts
  - Edge cases and error handling

- Update **README.md** with user-facing changes
  - Usage examples
  - API documentation
  - Migration guides (if breaking changes)
  - Feature descriptions

### 2. Create Tests

**Before implementing features:**

- Write comprehensive test suites that verify the specifications
- Cover all scenarios described in SPEC.md
- Include:
  - Unit tests for individual functions/classes
  - Integration tests for component interactions
  - Edge cases and error scenarios
  - Type safety tests (TypeScript)

**Tests should fail initially** - this is Test-Driven Development (TDD).

### 3. Implement Changes

**Now write the code:**

- Implement features to make tests pass
- Follow specifications exactly as written in SPEC.md
- Maintain strict TypeScript configurations
- Add inline documentation for complex logic
- Ensure type safety throughout

### 4. Run Quality Checks

**Before committing:**

Run all quality checks across the **entire monorepo**:

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Tests
pnpm test

# Format checking
pnpm format:check

# Build verification
pnpm build
```

All checks must pass without warnings or errors.

## Quality Standards

### Maximum Quality, No Shortcuts

- **DO NOT reduce scope** to save time
- **DO NOT skip tests** to speed up development
- **DO NOT remove functionality** to avoid effort
- **DO NOT lower compiler/linter strictness** to bypass errors

### Strict Configurations

This project uses strict configurations:

#### TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### ESLint
- All recommended rules enabled
- No suppressions without explicit justification
- Custom rules for architectural boundaries (dogfooding our own tool)

### Test Coverage

- Aim for 100% coverage of public APIs
- Test both happy paths and error cases
- Include boundary value tests
- Test TypeScript type definitions with type assertions
- Mock external dependencies appropriately

### Code Style

- Use TypeScript's type system fully
- Prefer immutability
- Write self-documenting code
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Follow SOLID principles

## Stricture-Specific Guidelines

These guidelines are specific to working on the Stricture architecture enforcement tool.

### Preset Design

#### 35. Presets Must Be Complete
- [ ] With deny-by-default, presets must cover ALL legitimate imports
- [ ] Missing allowed rule = user gets confusing deny-by-default error
- [ ] Better to have comprehensive rules than minimal rules

#### 36. Preset Boundaries Should Match Real Projects
- [ ] Use patterns that work with common project structures
- [ ] `src/core/domain/**` not `domain/**` (too broad)
- [ ] Consider variations: `src/{core/,}domain/**` to match multiple styles

#### 37. Rule IDs Should Be Descriptive
- [ ] Use kebab-case: `domain-isolation` not `domainIsolation`
- [ ] Include direction: `driving-to-application` not `driving-rule`
- [ ] Include purpose: `driven-implements-ports` not `driven-ports`

### Edge Cases & Special Handling

#### 38. External Type Definitions (@types)
- [ ] `node_modules/@types/**` are external but often needed
- [ ] Allow with specific pattern: `{ to: { pattern: 'node_modules/@types/**' }, allowed: true }`
- [ ] This overrides general external denial via specificity

#### 39. Self-Imports at All Levels
- [ ] Every layer should be able to import itself
- [ ] domain → domain, ports → ports, application → application, etc.
- [ ] Use explicit rules, don't rely on absence of deny rule

#### 40. Multiple Boundaries Can Have Same Tag
- [ ] `driving-adapters` and `driven-adapters` both have `adapters` tag
- [ ] This allows rules like: `from: { tag: 'adapters' }, to: { tag: 'domain' }, allowed: false`
- [ ] More specific tags (`driving`, `driven`) allow finer control

### CI/CD

#### 41. GitHub Actions Configuration
- [ ] Use exact pnpm version from package.json (8.15.0)
- [ ] Use Node.js 20.x (LTS)
- [ ] Cache pnpm store and turbo cache
- [ ] Run: build, test, lint, type-check
- [ ] Fast-fail on any error

#### 42. Turbo Configuration
- [ ] Use turbo for parallel builds/tests
- [ ] Cache builds between runs
- [ ] Pipeline: install → build → test → lint

### Version Management

#### 43. Semantic Versioning
- [ ] Breaking changes (API changes) → Major version
- [ ] New features (new presets, new rules) → Minor version
- [ ] Bug fixes, docs → Patch version

#### 44. Changelog
- [ ] Document all preset changes (rules added/removed/modified)
- [ ] Document breaking changes prominently
- [ ] Link to migration guides for breaking changes

### Performance

#### 45. Rule Sorting is Cached
- [ ] Sort rules by specificity ONCE per validation run
- [ ] Don't re-calculate specificity for each import
- [ ] Cache boundary matches where possible

#### 46. Pattern Matching Optimization
- [ ] Use micromatch efficiently
- [ ] Normalize paths once, not per rule
- [ ] Consider caching boundary matches for same file

### Future Considerations

#### 47. Plugin System (Future)
- [ ] Custom rules should use same specificity system
- [ ] Custom rules integrated into existing rule sorting
- [ ] Plugin interface should delegate to core validation

#### 48. IDE Integration (Future)
- [ ] Same validation logic as ESLint (reuse core)
- [ ] Show violations inline in editor
- [ ] Provide quick-fixes based on rule suggestions

#### 49. Config Schema Validation (Future)
- [ ] JSON schema for .stricture/config.json
- [ ] Validate on load, fail fast with clear messages
- [ ] Auto-complete in IDEs via JSON schema

#### 50. Multi-Project Support (Future)
- [ ] Monorepo with multiple .stricture/config.json files
- [ ] Per-package configurations
- [ ] Shared presets across projects
