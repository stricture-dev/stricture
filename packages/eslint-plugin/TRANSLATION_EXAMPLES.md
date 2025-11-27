# Translation Examples: Stricture → eslint-plugin-boundaries

Concrete examples showing how each preset would be translated.

## Example 1: Hexagonal Preset

### Stricture Config

```typescript
// .stricture/config.json
{
  "preset": "@stricture/hexagonal"
}
```

### Boundaries Config (Generated)

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['@eslint-plugin-boundaries'],
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow', // ⚠️ Simulating deny-by-default

      elements: [
        // BOUNDARY: domain
        // Description: Pure business logic - entities, value objects, domain services
        // Layer: 0 (innermost)
        // Tags: core, domain
        {
          type: 'domain',
          pattern: 'src/core/domain/**',
          mode: 'file'
        },

        // BOUNDARY: ports
        // Description: Interface definitions for external interactions
        // Layer: 1
        // Tags: core, ports
        {
          type: 'ports',
          pattern: 'src/core/ports/**',
          mode: 'file'
        },

        // BOUNDARY: application
        // Description: Use cases that orchestrate domain and ports
        // Layer: 2
        // Tags: core, application
        {
          type: 'application',
          pattern: 'src/core/application/**',
          mode: 'file'
        },

        // BOUNDARY: driving-adapters
        // Description: Primary adapters - entry points that call the application (CLI, HTTP, etc.)
        // Layer: 3
        // Tags: adapters, driving
        {
          type: 'driving-adapters',
          pattern: 'src/adapters/driving/**',
          mode: 'file'
        },

        // BOUNDARY: driven-adapters
        // Description: Secondary adapters - implementations of ports called by application (Repositories, APIs)
        // Layer: 3
        // Tags: adapters, driven
        {
          type: 'driven-adapters',
          pattern: 'src/adapters/driven/**',
          mode: 'file'
        },

        // BOUNDARY: external (auto-injected)
        // Virtual boundary for npm packages
        {
          type: 'external',
          pattern: 'node_modules/**',
          mode: 'file'
        }
      ],

      rules: [
        // ========================================
        // HIGH SPECIFICITY RULES (sorted first)
        // ========================================

        // RULE: domain-self-imports (allow)
        // Domain files can import other domain files
        {
          from: 'domain',
          allow: ['domain']
        },

        // RULE: domain-isolation (deny)
        // Description: Domain layer must remain pure with no external dependencies
        // Specificity: 101 (domain + wildcard)
        // BAD: import { Database } from '../../adapters/database'
        // BAD: import axios from 'axios'
        // GOOD: import { Order } from './order'
        {
          from: 'domain',
          disallow: ['*'],
          message: 'Domain layer must remain pure - no dependencies on other layers or external libraries'
        },

        // RULE: ports-to-domain (allow)
        // Ports define interfaces using domain types
        {
          from: 'ports',
          allow: ['domain', 'ports', 'external']
        },

        // RULE: application-to-domain (allow)
        // Application layer orchestrates domain entities
        {
          from: 'application',
          allow: ['domain', 'ports', 'application', 'external']
        },

        // RULE: application-not-adapters (deny)
        // Application layer cannot import adapters directly
        // BAD: import { PostgresRepository } from '../../adapters/driven/postgres-repository'
        // GOOD: import { UserRepository } from '../ports/user-repository'
        {
          from: 'application',
          disallow: ['driving-adapters', 'driven-adapters'],
          message: 'Application layer should depend on port interfaces, not concrete adapter implementations'
        },

        // RULE: driving-to-application (allow)
        // Driving adapters invoke application use cases
        {
          from: 'driving-adapters',
          allow: ['application', 'ports', 'external']
        },

        // RULE: driving-not-domain (deny)
        // Driving adapters should not import domain directly
        // BAD: import { User } from '../../core/domain/user'  // In CLI adapter
        // GOOD: import { CreateUserUseCase } from '../../core/application/create-user'
        {
          from: 'driving-adapters',
          disallow: ['domain', 'driven-adapters', 'driving-adapters'],
          message: 'Driving adapters (CLI, HTTP) should call the application layer, not domain directly'
        },

        // RULE: driven-implements-ports (allow)
        // Driven adapters implement port interfaces
        {
          from: 'driven-adapters',
          allow: ['ports', 'domain', 'external']
        },

        // RULE: driven-not-application (deny)
        // Driven adapters are passive and cannot call application use cases
        // BAD: import { CreateUserUseCase } from '../../core/application/create-user'
        // GOOD: import { UserRepository } from '../../core/ports/user-repository'
        {
          from: 'driven-adapters',
          disallow: ['application', 'driving-adapters', 'driven-adapters'],
          message: 'Driven adapters (repositories, external APIs) are passive. They cannot call use cases.'
        }
      ]
    }]
  }
}
```

## Example 2: NextJS Preset

### Stricture Config

```typescript
// .stricture/config.json
{
  "preset": "@stricture/nextjs"
}
```

### Boundaries Config (Generated)

```javascript
module.exports = {
  plugins: ['@eslint-plugin-boundaries'],
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',

      elements: [
        // BOUNDARY: server-components
        // Runtime: server
        {
          type: 'server-components',
          pattern: 'components/server/**',
          mode: 'file'
        },

        // BOUNDARY: client-components
        // Runtime: client
        {
          type: 'client-components',
          pattern: 'components/client/**',
          mode: 'file'
        },

        // BOUNDARY: app-routes
        // Runtime: server
        {
          type: 'app-routes',
          pattern: 'app/**',
          mode: 'file'
        },

        // BOUNDARY: api-routes
        // Runtime: server
        {
          type: 'api-routes',
          pattern: 'app/api/**',
          mode: 'file'
        },

        // BOUNDARY: server-utils
        // Runtime: server
        {
          type: 'server-utils',
          pattern: 'lib/server/**',
          mode: 'file'
        },

        // BOUNDARY: shared-utils
        // Runtime: universal
        // ⚠️ Negative pattern: lib excluding server subfolder
        {
          type: 'shared-utils',
          pattern: 'lib/!(server)/**',
          mode: 'file'
        },

        // BOUNDARY: server-actions
        // Runtime: server
        {
          type: 'server-actions',
          pattern: 'actions/**',
          mode: 'file'
        },

        // BOUNDARY: external
        {
          type: 'external',
          pattern: 'node_modules/**',
          mode: 'file'
        }
      ],

      rules: [
        // CRITICAL: Client cannot import server-only code
        // RULE: client-no-server-utils (deny)
        // BAD: import { db } from '@/lib/server/database'
        // GOOD: import { getUsers } from '@/actions/users'
        {
          from: 'client-components',
          disallow: ['server-utils', 'api-routes'],
          message: 'Client Components cannot import server-only code. Use Server Actions or API routes instead.'
        },

        // RULE: client-to-server-actions (allow)
        {
          from: 'client-components',
          allow: ['server-actions', 'client-components', 'shared-utils', 'external']
        },

        // RULE: server-components-to-server-utils (allow)
        {
          from: 'server-components',
          allow: ['server-utils', 'client-components', 'server-components', 'shared-utils', 'external']
        },

        // RULE: api-no-components (deny)
        // API routes should contain business logic only, not UI components
        // BAD: import { UserCard } from '@/components/user-card'
        // GOOD: import { getUserService } from '@/lib/server/user-service'
        {
          from: 'api-routes',
          disallow: ['server-components', 'client-components'],
          message: 'API routes should contain business logic only, not UI components.'
        },

        // RULE: api-to-server-utils (allow)
        {
          from: 'api-routes',
          allow: ['server-utils', 'api-routes', 'shared-utils', 'external']
        },

        // RULE: app-routes-to-components (allow)
        {
          from: 'app-routes',
          allow: ['server-components', 'client-components', 'server-utils', 'server-actions', 'app-routes', 'shared-utils', 'external']
        },

        // RULE: actions-to-server-utils (allow)
        {
          from: 'server-actions',
          allow: ['server-utils', 'server-actions', 'shared-utils', 'external']
        },

        // RULE: server-utils-self-imports (allow)
        {
          from: 'server-utils',
          allow: ['server-utils', 'shared-utils', 'external']
        },

        // RULE: shared-self-imports (allow)
        {
          from: 'shared-utils',
          allow: ['shared-utils', 'external']
        }
      ]
    }]
  }
}
```

## Example 3: NestJS Preset (Partial)

### Key Translation Differences

```javascript
elements: [
  // File extension patterns
  {
    type: 'controllers',
    pattern: 'src/**/*.controller.ts',  // ✅ Supported by boundaries
    mode: 'file'
  },

  // Specific file
  {
    type: 'main',
    pattern: 'src/main.ts',  // ✅ Specific file pattern
    mode: 'file'
  },

  // Subfolder anywhere pattern
  {
    type: 'dtos',
    pattern: 'src/**/dto/**',  // ✅ Supported
    mode: 'file'
  }
],

rules: [
  // CRITICAL: DTOs cannot import Entities
  // RULE: dtos-not-entities (deny)
  // BAD: import { User } from '../entities/user.entity'
  // GOOD: Define DTO independently
  {
    from: 'dtos',
    disallow: ['entities'],
    message: 'DTOs should not import entities. DTOs define API contracts (input/output), while entities are internal database models.'
  },

  // CRITICAL: Controllers cannot import Repositories
  // Must go through Services
  {
    from: 'controllers',
    disallow: ['repositories', 'entities', 'controllers'],
    message: 'Controllers should not import repositories directly. Use services as an intermediary.'
  },

  // Allowed: Controllers → Services → Repositories/Entities
  {
    from: 'controllers',
    allow: ['services', 'dtos', 'guards', 'pipes', 'interceptors', 'decorators', 'common', 'config', 'external']
  },

  {
    from: 'services',
    allow: ['entities', 'repositories', 'dtos', 'services', 'common', 'config', 'external']
  }
]
```

## Example 4: Modular Preset

### Unique Feature: Public API Enforcement

```javascript
elements: [
  // BOUNDARY: module-public
  // Only index.ts files are public API
  // Specificity: Very high (exact filename)
  {
    type: 'module-public',
    pattern: 'src/features/*/index.ts',  // ⚠️ Wildcard in middle
    mode: 'file'
  },

  // BOUNDARY: module-internal
  // All other files in features
  {
    type: 'module-internal',
    pattern: 'src/features/**',  // Less specific
    mode: 'file'
  },

  // BOUNDARY: shared
  {
    type: 'shared',
    pattern: 'src/shared/**',
    mode: 'file'
  },

  {
    type: 'external',
    pattern: 'node_modules/**',
    mode: 'file'
  },

  // HIGH SPECIFICITY: TypeScript type definitions
  // Must come before general external rules
  {
    type: 'types',
    pattern: 'node_modules/@types/**',
    mode: 'file'
  }
],

rules: [
  // Cross-module imports must go through public API
  // RULE: module-internal-to-module-public (allow)
  {
    from: 'module-internal',
    allow: ['module-public', 'module-internal', 'shared', 'external', 'types']
  },

  // Public API can import from same feature
  {
    from: 'module-public',
    allow: ['module-public', 'module-internal', 'shared', 'external', 'types']
  },

  // CRITICAL: Shared cannot depend on features
  // RULE: shared-not-features (deny)
  // BAD: import { User } from '../../features/auth/types'
  // GOOD: Define generic interface in shared or pass as parameter
  {
    from: 'shared',
    disallow: ['module-public', 'module-internal'],
    message: 'Shared utilities cannot import from feature modules. Keep shared code generic and feature-independent.'
  },

  {
    from: 'shared',
    allow: ['shared', 'external', 'types']
  },

  // Types are allowed from anywhere
  {
    from: '*',
    allow: ['types']
  }
]
```

## Translation Algorithm

### Step 1: Parse Stricture Config

```typescript
interface StrictureConfig {
  preset?: string
  boundaries?: BoundaryDefinition[]
  rules?: ArchRule[]
}

// Load preset if specified
const preset = loadPreset(config.preset)
const boundaries = mergeBoundaries(preset?.boundaries, config.boundaries)
const rules = mergeRules(preset?.rules, config.rules)
```

### Step 2: Transform Boundaries

```typescript
function transformBoundaries(boundaries: BoundaryDefinition[]) {
  const elements = boundaries.map(boundary => ({
    // Use primary tag (first tag) as type
    type: boundary.tags?.[0] || boundary.name,
    pattern: boundary.pattern,
    mode: boundary.mode,
    // Add comment with metadata
    __comment: {
      name: boundary.name,
      description: boundary.metadata?.description,
      layer: boundary.metadata?.layer,
      tags: boundary.tags,
      ...boundary.metadata
    }
  }))

  // Inject external boundary
  elements.push({
    type: 'external',
    pattern: 'node_modules/**',
    mode: 'file',
    __comment: {
      description: 'External npm packages (auto-injected)'
    }
  })

  // Find pattern-based rules and create dedicated elements
  // E.g., node_modules/@types/** → create 'types' element

  return elements
}
```

### Step 3: Calculate Rule Specificity

```typescript
function calculateSpecificity(rule: ArchRule): number {
  let score = 0

  // From specificity
  if (rule.from.pattern?.includes('node_modules')) {
    score += 10000
  } else if (rule.from.pattern) {
    score += 1000
  } else if (rule.from.tag === '*') {
    score += 1
  } else {
    score += 100
  }

  // To specificity
  if (rule.to.pattern?.includes('node_modules')) {
    score += 10000
  } else if (rule.to.pattern) {
    score += 1000
  } else if (rule.to.tag === '*') {
    score += 1
  } else {
    score += 100
  }

  return score
}
```

### Step 4: Sort and Transform Rules

```typescript
function transformRules(rules: ArchRule[], boundaries: BoundaryDefinition[]) {
  // Calculate specificity for each rule
  const withSpecificity = rules.map(rule => ({
    rule,
    specificity: calculateSpecificity(rule)
  }))

  // Sort by specificity (descending)
  withSpecificity.sort((a, b) => b.specificity - a.specificity)

  // Group by from-boundary for readability
  const grouped = groupBy(withSpecificity, r => r.rule.from.tag || r.rule.from.pattern)

  // Transform to boundaries format
  const boundariesRules = []

  for (const [fromTag, rulesForFrom] of Object.entries(grouped)) {
    const allowList = []
    const disallowList = []
    const messages = {}

    for (const { rule } of rulesForFrom) {
      const toTag = rule.to.tag || createElementForPattern(rule.to.pattern)

      if (rule.allowed) {
        allowList.push(toTag)
      } else {
        disallowList.push(toTag)
        if (rule.message) {
          messages[toTag] = rule.message
        }
      }
    }

    // Could generate as:
    // Option 1: Single rule per from with allow/disallow arrays
    boundariesRules.push({
      from: fromTag,
      allow: allowList,
      disallow: disallowList,
      message: messages,
      __comment: {
        // Original rule IDs, descriptions, examples
      }
    })

    // Option 2: Separate rules (more explicit)
    if (allowList.length) {
      boundariesRules.push({
        from: fromTag,
        allow: allowList
      })
    }
    if (disallowList.length) {
      boundariesRules.push({
        from: fromTag,
        disallow: disallowList,
        message: messages
      })
    }
  }

  return boundariesRules
}
```

### Step 5: Generate Config File

```typescript
function generateBoundariesConfig(
  elements,
  rules,
  options = { includeComments: true }
) {
  const config = {
    plugins: ['@eslint-plugin-boundaries'],
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow', // Simulate deny-by-default
        elements,
        rules
      }]
    }
  }

  if (options.includeComments) {
    // Generate with rich comments
    return generateWithComments(config)
  }

  return JSON.stringify(config, null, 2)
}
```

## Limitations and Workarounds

### Limitation 1: Deny-by-Default

**Problem:** Boundaries allows by default, Stricture denies by default.

**Workaround:**
```javascript
{
  default: 'disallow',  // Add this
  // ... rest of config
}
```

**Trade-off:** Not sure if boundaries supports `default: 'disallow'`. May need to add explicit catch-all deny rules.

### Limitation 2: Multi-Tag Boundaries

**Problem:** Boundaries element has one `type`, Stricture boundary has multiple `tags`.

**Workaround 1: Use primary tag**
```javascript
// Stricture
{ name: 'driving-adapters', tags: ['adapters', 'driving'] }

// Boundaries (lose 'adapters' tag)
{ type: 'driving', pattern: 'src/adapters/driving/**' }
```

**Workaround 2: Create multiple elements**
```javascript
// Stricture
{ name: 'driving-adapters', tags: ['adapters', 'driving'] }

// Boundaries (duplicate pattern)
{ type: 'adapters', pattern: 'src/adapters/driving/**' }
{ type: 'driving', pattern: 'src/adapters/driving/**' }
```

**Trade-off:** Lose semantic grouping or duplicate definitions.

### Limitation 3: Examples

**Problem:** Boundaries doesn't support `examples: { good, bad }`.

**Workaround:** Add as comments above rules.

```javascript
// RULE: domain-isolation
// ❌ BAD: import { Database } from '../../adapters/database'
// ❌ BAD: import axios from 'axios'
// ✅ GOOD: import { Order } from './order'
{
  from: 'domain',
  disallow: ['*'],
  message: 'Domain layer must remain pure...'
}
```

### Limitation 4: Metadata

**Problem:** Boundaries doesn't support custom metadata.

**Workaround:** Include in comments.

```javascript
// BOUNDARY: domain
// Description: Pure business logic - entities, value objects
// Layer: 0 (innermost)
// Tags: core, domain
// Visibility: internal
{
  type: 'domain',
  pattern: 'src/core/domain/**',
  mode: 'file'
}
```

## Testing Strategy

1. **Translate each preset**
2. **Create test projects** with intentional violations
3. **Run both tools** (Stricture and boundaries)
4. **Compare violation reports**
5. **Document differences**
6. **Refine translation algorithm**

## Next Steps

1. Implement `translateConfig()` function
2. Handle edge cases (wildcards, external, @types)
3. Generate with comments
4. Test against all 6 presets
5. Document limitations clearly
6. Create migration guide for users
