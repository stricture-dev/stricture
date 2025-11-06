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

These guidelines are specific to working on the Stricture architecture enforcement tool. This section contains critical design decisions and implementation rules for Stricture.

### Core Design Principles

#### 1. Spec-Driven Development
- [ ] README.md and SPEC.md are **executable contracts** - implementation must match exactly
- [ ] Every function signature, algorithm, and code example in docs MUST work as written
- [ ] If implementation differs from spec, the spec is wrong - fix spec first, then code
- [ ] Code examples in README must be runnable without modification

#### 2. Architectural Philosophy
- [ ] Stricture = **strict by default** - never compromise on correctness for convenience
- [ ] Presets enforce REAL architecture patterns, not simplified versions
- [ ] Better to error than allow unintended dependencies
- [ ] "Zero config" means preset works out-of-the-box, not "architecture is optional"

#### 3. Package Separation
- [ ] `@stricture/core` - Pure validation engine, ZERO ESLint coupling
- [ ] `@stricture/eslint-plugin` - Thin wrapper, delegates to core (no validation logic)
- [ ] Presets - Pure data (ArchPreset), NO validation logic, NO imports from core/validation
- [ ] Examples - Use presets without overrides when possible

### Core Package (@stricture/core)

#### Validation Algorithm

##### 4. Import Validation Order
```typescript
validateImport(fromPath, toPath, rules, boundaries) {
  1. Detect if external (toPath contains 'node_modules')
  2. Find fromBoundary
  3. Find toBoundary (or create virtual 'external' boundary)
  4. Sort rules by SPECIFICITY (highest first)
  5. Check each rule in order
  6. First matching rule wins
  7. If no rule matches → DENY by default
}
```

##### 5. Rule Specificity System
- [ ] Specificity = numeric score, higher = more specific
- [ ] Pattern with node_modules (not **): 10000 points
- [ ] Regular pattern (src/domain/**): 1000 points
- [ ] Specific tag (domain, ports): 100 points
- [ ] Wildcard (*): 1 point
- [ ] Add from + to scores for total
- [ ] Sort rules by score DESC before evaluation
- [ ] **Array order doesn't matter** - specificity determines precedence

##### 6. Deny-By-Default Policy
- [ ] If NO rule matches an import → **DENY with helpful message**
- [ ] Message must suggest how to allow the import
- [ ] Example rule in message with correct syntax
- [ ] Never silently allow imports without explicit rules

##### 7. External Dependencies
- [ ] Detect by: `toPath.includes('node_modules')`
- [ ] Create virtual boundary: `{ name: 'external', pattern: 'node_modules/**', mode: 'file' }`
- [ ] Special tag: `{ tag: 'external' }` matches external dependencies
- [ ] External imports denied by default unless explicit rule allows

##### 8. Pattern vs Tag Matching
- [ ] If rule has `to.pattern` → match against actual `toPath` using `matchesPattern()`
- [ ] If rule has `to.tag` → match against `toBoundary` using `matchesRuleBoundary()`
- [ ] Pattern-based rules are more specific than tag-based (by design)

##### 9. Wildcard Behavior
- [ ] `{ tag: '*' }` matches any boundary that exists (not null/undefined)
- [ ] `{ pattern: '**' }` matches all files
- [ ] Wildcards have lowest specificity (score = 1)

### Hexagonal Preset (@stricture/hexagonal)

#### 10. Driving vs Driven Distinction (MANDATORY)
- [ ] Preset MUST define separate boundaries: `driving-adapters` and `driven-adapters`
- [ ] Pattern: `src/adapters/driving/**` and `src/adapters/driven/**`
- [ ] Do NOT use generic `src/adapters/**` - this defeats the purpose
- [ ] This is NOT optional - it's fundamental to hexagonal architecture

#### 11. Driving Adapters (Primary/Active)
- [ ] Entry points that CALL the application (CLI, HTTP, GraphQL)
- [ ] Can import: application, ports, external
- [ ] Cannot import: domain (use application), driven adapters (use DI)
- [ ] Should be independent of each other

#### 12. Driven Adapters (Secondary/Passive)
- [ ] Implementations of ports that application CALLS (Repositories, APIs)
- [ ] Can import: ports, domain types, external
- [ ] Cannot import: application (passive!), driving adapters
- [ ] Should be independent of each other

#### 13. Domain Layer Rules
- [ ] Domain is PURE - zero external dependencies
- [ ] Domain CAN import other domain files (self-imports)
- [ ] Domain CANNOT import: ports, application, adapters, external
- [ ] No side effects, no I/O, no port calls in domain entities
- [ ] Use `domain-isolation` rule with `to: { tag: '*' }` denied
- [ ] Use `domain-self-imports` rule with `to: { tag: 'domain' }` allowed

#### 14. Driven Adapters CAN Import Domain Types
- [ ] **This is correct!** Driven adapters implement ports that use domain types
- [ ] Example: `UserRepository.save(user: User)` - repository must import `User`
- [ ] Do NOT force re-exports from ports - this is an anti-pattern
- [ ] Rule: `driven-to-domain` with `allowed: true`
- [ ] Driving adapters still CANNOT import domain

#### 15. Side Effects Belong in Application Layer
- [ ] Domain entities do NOT call ports for side effects (audit, notifications)
- [ ] Application layer orchestrates: domain logic + side effects
- [ ] Alternative: Domain Events (advanced pattern)

#### 16. Composition Root Pattern
- [ ] Dependency wiring happens in `index.ts` (composition root)
- [ ] Driving adapters receive use cases via constructor
- [ ] Driven adapters are instantiated and injected into use cases
- [ ] No adapter knows about specific implementations of other adapters

#### 17. When to Use `allowed: false` Rules
- [ ] Only use when providing CUSTOM error message with guidance
- [ ] Only use when OVERRIDING a more general allowed rule
- [ ] Otherwise rely on deny-by-default (no redundant rules)
- [ ] Example: `domain-isolation` has valuable message → keep
- [ ] Example: `driven-not-driving` has no special value → rely on deny-by-default

### ESLint Plugin (@stricture/eslint-plugin)

#### 18. Thin Wrapper Principle
- [ ] Plugin is ONLY an ESLint adapter - no validation logic
- [ ] Delegates to `core.validateImport()` for validation
- [ ] Delegates to `core.resolveImportPath()` for resolution
- [ ] No files like: `classify-file.ts`, `resolve-import.ts`, `check-violation.ts`
- [ ] Only: `load-config.ts`, `load-tsconfig.ts`, `format-error.ts`, rule implementation

#### 19. ESLint Integration
- [ ] Rule name: `@stricture/enforce-boundaries`
- [ ] Loads `.stricture/config.json` once, caches it
- [ ] For each import AST node, calls `validateImport()`
- [ ] Formats errors with file location and helpful messages

### File Structure & Naming

#### 20. Import Style
- [ ] Use `import path from 'path'` NOT `import path from 'node:path'`
- [ ] Reason: Better TypeScript declaration generation compatibility
- [ ] Use `.js` extensions in imports: `from './file.js'` not `from './file'`

#### 21. Mode Field in Types
- [ ] `BoundaryDefinition` has `mode: 'file' | 'folder'`
- [ ] `BoundaryPattern` in rules also has `mode` (inherit from boundary definition)
- [ ] When using tag in rules, mode is matched from boundary definition

#### 22. Type Exports
- [ ] Export types with `export type` for interfaces: `export type { ArchRule }`
- [ ] Export implementations with `export`: `export { validateImport }`

### Testing

#### 23. Test-Driven Development
- [ ] Write tests FIRST based on SPEC.md
- [ ] Implement to pass tests
- [ ] Target >90% coverage
- [ ] Tests must cover: happy path, edge cases, error messages

#### 24. Critical Test Coverage
- [ ] Deny-by-default behavior (no rule matches)
- [ ] Rule specificity (more specific wins)
- [ ] Specificity independent of array order
- [ ] External dependency detection
- [ ] Pattern vs tag matching
- [ ] Wildcard behavior
- [ ] Each preset rule individually

### Examples

#### 25. Simple Hexagonal Example
- [ ] Config MUST be: `{ "preset": "@stricture/hexagonal" }`
- [ ] NO boundary overrides
- [ ] NO rule overrides
- [ ] File structure: `src/adapters/driving/` and `src/adapters/driven/`
- [ ] Demonstrates zero-config principle

#### 26. Composition Root in Examples
- [ ] `index.ts` wires all dependencies
- [ ] Driving adapters receive use cases via constructor (never create them)
- [ ] Example must demonstrate dependency injection correctly

### Documentation

#### 27. README vs SPEC
- [ ] README.md - User-facing, how to use, examples
- [ ] SPEC.md - Implementation contract, algorithms, technical details
- [ ] Both must be consistent with actual implementation
- [ ] Code examples in README must be copy-pasteable and work

#### 28. Error Messages
- [ ] Must explain WHY the import is forbidden
- [ ] Must suggest HOW to fix (with code example when possible)
- [ ] Must reference architectural principle violated
- [ ] Example: "Domain must be pure" not "Import not allowed"

#### 29. Architectural Guidance in Rules
- [ ] Rules with `allowed: false` should have `examples: { bad: [...], good: [...] }`
- [ ] Show WHY the pattern is wrong
- [ ] Show WHAT to do instead
- [ ] Link to composition root pattern when relevant

### Common Anti-Patterns to Avoid

#### 30. DO NOT Re-export Domain from Ports
```typescript
// ❌ WRONG
// ports/user-repository.ts
export { User } from '../domain/user'  // Anti-pattern!

// ✅ RIGHT
// adapters/driven/memory-repository.ts
import { User } from '../../core/domain/user'  // Direct import OK
```

#### 31. DO NOT Put Validation Logic in Presets
```typescript
// ❌ WRONG - preset importing validation
import { validateBoundary } from '@stricture/core'

// ✅ RIGHT - preset is pure data
export const hexagonalPreset: ArchPreset = {
  boundaries: [...],
  rules: [...]
}
```

#### 32. DO NOT Duplicate Logic from Core in ESLint Plugin
```typescript
// ❌ WRONG - plugin has its own validation
function checkViolation(from, to) { /* custom logic */ }

// ✅ RIGHT - plugin delegates to core
import { validateImport } from '@stricture/core'
const result = validateImport(from, to, rules, boundaries)
```

#### 33. DO NOT Assume Array Order Matters (Post-Specificity)
```typescript
// ❌ WRONG assumption
rules: [
  { /* specific rule first */ },  // Order doesn't matter anymore!
  { /* general rule second */ }
]

// ✅ RIGHT - specificity handles it
rules: [
  { /* any order */ },
  { /* specificity determines precedence */ }
]
```

#### 34. DO NOT Use Generic "adapters" Boundary in Hexagonal
```typescript
// ❌ WRONG - too generic
{ name: 'adapters', pattern: 'src/adapters/**' }

// ✅ RIGHT - distinguish driving vs driven
{ name: 'driving-adapters', pattern: 'src/adapters/driving/**' }
{ name: 'driven-adapters', pattern: 'src/adapters/driven/**' }
```

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

---

## Implementation Checklist

Before submitting any change, verify:

### Before Writing Code

- [ ] Read relevant SPEC.md section(s)
- [ ] Read relevant README.md section(s)
- [ ] Understand which package is affected (core/eslint-plugin/preset/example)
- [ ] Check if similar code exists elsewhere to maintain consistency
- [ ] Review architectural decisions above that apply to this change

### While Writing Code

#### If Modifying Core Validation
- [ ] Does it follow the algorithm in SPEC.md lines 452-521?
- [ ] Does it maintain specificity-based rule sorting?
- [ ] Does it implement deny-by-default correctly?
- [ ] Does it handle external dependencies correctly?
- [ ] Does it match patterns using matchesPattern() correctly?

#### If Modifying ESLint Plugin
- [ ] Is this delegating to core, not reimplementing logic?
- [ ] Am I only doing ESLint-specific work (AST, formatting)?
- [ ] Would this logic be useful in other integrations? (If yes, move to core)

#### If Modifying a Preset
- [ ] Is this pure data (ArchPreset), no logic?
- [ ] Do rules cover ALL legitimate imports for this architecture?
- [ ] Are driving/driven boundaries separate (for hexagonal)?
- [ ] Do `allowed: false` rules provide valuable custom messages?
- [ ] Are there redundant rules that deny-by-default would catch?

#### If Modifying an Example
- [ ] Does config use preset without overrides?
- [ ] Does file structure match preset expectations?
- [ ] Does composition root demonstrate proper DI?
- [ ] Can I run the example and see it work?

### After Writing Code

- [ ] Write/update tests FIRST if using TDD (or now if not)
- [ ] Run tests: `pnpm test`
- [ ] Run build: `pnpm build`
- [ ] Run lint: `pnpm lint`
- [ ] Check TypeScript: `pnpm type-check`
- [ ] Verify README examples still work
- [ ] Update SPEC.md if algorithm changed
- [ ] Update README.md if user-facing behavior changed
- [ ] Add comments explaining WHY, not just WHAT

### Before Committing

- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint violations
- [ ] Code examples in docs are tested/verified
- [ ] Commit message explains WHY, not just WHAT changed
- [ ] If fixing bug: explain what was wrong and how fix works

### Red Flags (STOP and Ask)

Stop and ask if you're about to:
- [ ] Add validation logic to ESLint plugin
- [ ] Import validation functions in a preset
- [ ] Make presets use generic "adapters" boundary
- [ ] Change rule precedence to depend on array order
- [ ] Allow imports by default (unless there's a strong reason)
- [ ] Remove deny-by-default behavior
- [ ] Add complexity without clear architectural benefit
- [ ] Change core algorithm without updating SPEC.md
- [ ] Break backwards compatibility without version bump

### Common Mistakes to Avoid

When you realize you're doing any of these, stop:
- [ ] "I'll just put this validation logic in the plugin..." → NO, use core
- [ ] "I'll add a quick fix without tests..." → NO, TDD or tests after
- [ ] "The comment is outdated but I'll fix it later..." → NO, fix now
- [ ] "This rule order matters..." → NO, specificity handles it
- [ ] "I'll make adapters import domain via port re-exports..." → NO, direct import OK for driven
- [ ] "I'll add node: prefix to imports..." → NO, use plain imports
- [ ] "I'll simplify the preset by removing driving/driven split..." → NO, that's fundamental
- [ ] "I'll allow imports without rules as default..." → NO, deny by default

### Questions to Ask Yourself

- [ ] Would a new developer understand this code in 6 months?
- [ ] Does this follow the principle of least surprise?
- [ ] Is this the simplest solution that works correctly?
- [ ] Have I introduced any coupling between packages?
- [ ] Does this change maintain backwards compatibility?
- [ ] Would this work in a real project, not just the example?

### Final Check

- [ ] Read through all changes one more time
- [ ] Verify changes align with architectural decisions above
- [ ] Ensure no temporary debug code remains
- [ ] Check that imports use correct style (no node:, .js extensions)
- [ ] Confirm tests cover the new code paths
- [ ] Push and watch CI pass
