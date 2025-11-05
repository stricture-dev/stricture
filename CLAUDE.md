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
- **DO NOT remove functionality** to avoid complexity
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

## Monorepo Structure

```
stricture/
├── packages/          # Core packages
│   ├── core/         # Shared types and utilities
│   ├── eslint-plugin/ # ESLint plugin implementation
│   ├── cli/          # Interactive CLI
│   ├── hexagonal/    # Architecture presets
│   ├── clean/
│   ├── layered/
│   ├── modular/
│   ├── nextjs/       # Framework integrations
│   └── nestjs/
├── apps/             # Applications
│   └── docs/         # Documentation site
├── examples/         # Example projects
├── tooling/          # Shared tooling configs
└── turbo.json        # Turborepo configuration
```

Each package follows the same structure:
- `README.md` - User documentation
- `SPEC.md` - Technical specification
- `src/` - Source code
- `tests/` - Test suite
- `package.json` - Package configuration
- `tsconfig.json` - TypeScript config

## Common Commands

### Development
```bash
pnpm dev              # Watch mode for all packages
pnpm build            # Build all packages
```

### Quality Checks
```bash
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript type checking
pnpm format           # Format all code
pnpm format:check     # Verify formatting
```

### Workspace Management
```bash
pnpm -F @stricture/core test    # Run tests for specific package
pnpm -F @stricture/core build   # Build specific package
```

## When Things Go Wrong

### Tests Failing
1. **Do not modify tests to pass** - fix the implementation
2. Check if SPEC.md needs clarification
3. Verify all edge cases are handled
4. Ensure error messages match specifications

### Type Errors
1. **Do not use `any` or `@ts-ignore`** - fix the types
2. Add proper type definitions
3. Use type guards and assertions correctly
4. Consider if the type error reveals a design issue

### Lint Errors
1. **Do not disable rules** - fix the code
2. Follow the linter's guidance
3. Refactor if complexity is too high
4. Use architectural patterns correctly

### Build Failures
1. Check all dependencies are installed
2. Verify TypeScript configurations
3. Ensure import paths are correct
4. Check for circular dependencies

## Package-Specific Guidelines

### @stricture/core
- Contains shared types and utilities
- Must have zero external dependencies (except TypeScript types)
- All exports must be fully typed
- Changes here affect all packages

### @stricture/eslint-plugin
- Core ESLint plugin implementation
- Must be compatible with ESLint's plugin API
- Include comprehensive rule tests
- Provide clear error messages and suggestions

### Architecture Presets (hexagonal, clean, layered, modular)
- Define boundary rules and configurations
- Include usage examples
- Document architectural patterns
- Provide migration guides

### Framework Integrations (nextjs, nestjs)
- Extend base architecture presets
- Handle framework-specific concerns
- Test against multiple framework versions
- Document framework compatibility

## Commit Messages

Follow Conventional Commits:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding or updating tests
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `chore`: Maintenance tasks

Example:
```
feat(eslint-plugin): add support for wildcard patterns

- Add wildcard matching in boundary patterns
- Update rule validation logic
- Add comprehensive tests for glob patterns

Closes #123
```

## Pull Request Checklist

Before submitting a PR, verify:

- [ ] SPEC.md updated with technical changes
- [ ] README.md updated with user-facing changes
- [ ] Tests added/updated for all changes
- [ ] All tests pass (`pnpm test`)
- [ ] No lint errors (`pnpm lint`)
- [ ] No type errors (`pnpm type-check`)
- [ ] Code formatted (`pnpm format`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Examples updated if API changed
- [ ] Commit messages follow conventions
- [ ] No reduction in scope or quality

## Philosophy

### Why This Workflow?

1. **Documentation First** - Clarifies intent before implementation
2. **Tests Second** - Defines success criteria objectively
3. **Implementation Third** - Code becomes the solution to pass tests
4. **Quality Always** - No shortcuts, maintain high standards

### Why Strict Rules?

This project enforces architectural boundaries for others. We must:
- **Dogfood our own tool** - Use Stricture on itself
- **Set an example** - Demonstrate best practices
- **Maintain trust** - Users rely on our quality standards
- **Enable scale** - Strict rules prevent technical debt

### Why No Shortcuts?

Shortcuts compound:
- Skipped tests = bugs in production
- Reduced scope = incomplete features
- Relaxed configs = type errors and runtime failures
- Outdated docs = confused users

**Quality is not negotiable.**

## Resources

- [Project README](./README.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

**Remember**: Every change must maintain the sync between SPEC.md, README.md, tests, and code. This is not optional—it's how we maintain quality and trust.
