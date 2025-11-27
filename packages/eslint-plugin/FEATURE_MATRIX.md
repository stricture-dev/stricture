# Stricture Preset Feature Matrix

Quick reference for features used across all presets.

## Boundary Features Used

| Feature | Hexagonal | Clean | Layered | Modular | NestJS | NextJS | Notes |
|---------|-----------|-------|---------|---------|---------|--------|-------|
| **name** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Always present |
| **pattern** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Always present |
| **mode: 'file'** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | All use 'file' |
| **mode: 'folder'** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Never used |
| **tags (2 tags)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Most common |
| **tags (3 tags)** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | NestJS only |
| **exclude** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Never used |
| **metadata.description** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Always present |
| **metadata.layer** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | 4/6 presets |
| **metadata.visibility** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | Modular only |
| **metadata.runtime** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | NextJS only |

## Pattern Types Used

| Pattern Type | Example | Usage |
|--------------|---------|-------|
| Simple glob | `src/domain/**` | Most common |
| File extension | `src/**/*.controller.ts` | NestJS |
| Specific file | `src/main.ts` | NestJS, Modular |
| Wildcard file | `src/features/*/index.ts` | Modular |
| Negative pattern | `lib/!(server)/**` | NextJS |
| Nested path | `src/core/domain/**` | Hexagonal, Clean |
| Subfolder pattern | `src/**/dto/**` | NestJS |

## Rule Features Used

| Feature | Count | % of Total | Notes |
|---------|-------|------------|-------|
| **Total Rules** | 134 | 100% | Across all presets |
| **allowed: true** | 96 | 72% | Most are allow rules |
| **allowed: false** | 38 | 28% | Restriction rules |
| **severity: 'error'** | 134 | 100% | All errors |
| **severity: 'warn'** | 0 | 0% | Never used |
| **Custom message** | 24 | 18% | Only on deny rules |
| **Examples** | 24 | 18% | Same as custom messages |
| **Tag-based from/to** | ~127 | 95% | Dominant pattern |
| **Pattern-based to** | 2 | 1% | Only @types rules |
| **Wildcard rules** | ~40 | 30% | * matching |
| **External rules** | 24 | 18% | Allow external deps |

## BoundaryPattern Types

| Pattern Type | Example | Count | Purpose |
|--------------|---------|-------|---------|
| **Tag-based** | `{ tag: 'domain', mode: 'file' }` | ~95% | Normal rules |
| **Pattern-based** | `{ pattern: 'node_modules/@types/**', mode: 'file' }` | ~2% | High specificity |
| **Wildcard** | `{ tag: '*', mode: 'file' }` | ~3% | Isolation, cross-cutting |
| **External** | `{ tag: 'external', mode: 'file' }` | ~18% | npm packages |

## Rule Categories

| Category | Count | Description |
|----------|-------|-------------|
| **Self-imports** | 35 | Layer can import itself |
| **Isolation rules** | 5 | Deny all outward deps |
| **External deps** | 24 | Allow npm packages |
| **Cross-cutting** | 7 | Available everywhere |
| **Type overrides** | 2 | @types specific |
| **Layer-to-layer** | 61 | Specific allowed deps |

## Stricture-Specific Features

| Feature | In Boundaries? | Translation Strategy |
|---------|----------------|----------------------|
| **Deny-by-default** | ❌ No | Document difference or add catch-all |
| **Auto rule sorting** | ❌ No | Pre-sort by specificity |
| **Virtual external boundary** | ❌ No | Inject explicit element |
| **Multi-tag boundaries** | ⚠️ Partial | Flatten or choose primary |
| **Pattern-based to** | ✅ Yes | Create dedicated element |
| **Custom metadata** | ❌ No | Convert to comments |
| **Examples in rules** | ❌ No | Convert to comments |
| **Custom messages** | ✅ Yes | Direct translation |

## Preset Statistics

| Preset | Boundaries | Rules | Allow Rules | Deny Rules | With Messages |
|--------|-----------|-------|-------------|------------|---------------|
| **Hexagonal** | 5 | 27 | 19 (70%) | 8 (30%) | 8 |
| **Clean** | 4 | 18 | 13 (72%) | 5 (28%) | 5 |
| **Layered** | 4 | 20 | 15 (75%) | 5 (25%) | 5 |
| **Modular** | 3 | 8 | 7 (88%) | 1 (12%) | 1 |
| **NestJS** | 12 | 42 | 35 (83%) | 7 (17%) | 7 |
| **NextJS** | 7 | 19 | 16 (84%) | 3 (16%) | 3 |
| **TOTAL** | **35** | **134** | **96 (72%)** | **38 (28%)** | **24** |

## Tag Usage Patterns

### Most Common Tags

| Tag | Occurrences | Presets |
|-----|-------------|---------|
| **external** | 24 rules | All |
| **domain** | 5 boundaries, 15+ rules | Hexagonal, Clean, Layered |
| **core** | 5 boundaries | Hexagonal, Clean, Layered |
| **application** | 3 boundaries, 12+ rules | Hexagonal, Layered |
| **nestjs** | 12 boundaries | NestJS |
| **server** | 5 boundaries, 12+ rules | NextJS |
| **client** | 2 boundaries, 6+ rules | NextJS |

### Tag Combinations

| Combination | Preset | Purpose |
|-------------|---------|---------|
| `['core', 'domain']` | Hexagonal, Clean, Layered | Core business logic |
| `['adapters', 'driving']` | Hexagonal | Entry point adapters |
| `['adapters', 'driven']` | Hexagonal | Implementation adapters |
| `['nestjs', 'controllers', 'presentation']` | NestJS | HTTP layer |
| `['components', 'server']` | NextJS | React Server Components |
| `['components', 'client']` | NextJS | Client Components |

## Critical Translation Requirements

### Must Handle

1. **External boundary injection**
   - All presets use `{ tag: 'external' }` in rules
   - Must create explicit `external` element in boundaries config

2. **Rule specificity sorting**
   - @types rules (pattern-based) must come before general external rules
   - Specific tag rules before wildcard rules
   - Calculate and sort before generation

3. **Self-import rules**
   - Every boundary needs a self-import allow rule
   - Pattern: `from: 'X', allow: ['X']`

4. **Wildcard handling**
   - `{ tag: '*' }` used in isolation rules
   - Need boundaries equivalent (possibly `disallow: ['*']`)

### Optional Features

1. **Comment generation**
   - Boundary descriptions from metadata
   - Rule examples from examples field
   - Layer numbers from metadata
   - Original rule IDs

2. **Error message enhancement**
   - Preserve custom messages (supported!)
   - Could append examples to messages

3. **Metadata preservation**
   - Convert to structured comments
   - JSON in comment for programmatic access?

## Translation Complexity Score

| Feature | Complexity | Reason |
|---------|-----------|--------|
| Basic boundaries | 🟢 Low | Direct mapping |
| Basic rules (tag-based) | 🟢 Low | Direct mapping |
| External boundary | 🟡 Medium | Must inject |
| Rule sorting | 🟡 Medium | Calculate specificity |
| Multi-tag boundaries | 🟡 Medium | Choose primary |
| Pattern-based to | 🟡 Medium | Create element |
| Wildcard rules | 🔴 High | Complex logic |
| Deny-by-default | 🔴 High | Philosophy difference |
| Custom metadata | 🟢 Low | Convert to comments |

**Overall: 🟡 Medium Complexity**
- Core translation is straightforward
- Edge cases require careful handling
- Philosophy differences need documentation
