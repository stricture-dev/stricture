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
