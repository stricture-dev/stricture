# @stricture/docs - Technical Specification

## Overview

Documentation website for Stricture built with **Astro Starlight**, serving as the central hub for guides, API docs, and examples. Pure static site generation with minimal JavaScript and blazing-fast performance.

## Architecture Decision: Why Starlight?

- **Pure Static** - Ships zero JavaScript by default, only adds JS for interactive components (islands)
- **Performance** - Lighthouse 100/100 scores, faster than Next.js SSG
- **Built for Docs** - Search, dark mode, mobile nav, syntax highlighting out-of-the-box
- **Modern DX** - TypeScript, Vite-powered, excellent tooling
- **SEO Optimized** - Static HTML, perfect for documentation discovery
- **React Islands** - Can use React components where needed (preset selector, playground)

## Responsibilities

- Serve documentation content from MDX files
- Provide interactive preset selector (React island)
- Display architecture diagrams (Mermaid)
- Offer code examples with syntax highlighting
- Built-in search functionality (Pagefind)
- Dark mode support
- Mobile-responsive design
- SEO optimization
- Static HTML output (zero server needed)

## Key Features

### 1. Homepage

- Hero section with value proposition
- Quick start code example
- Preset comparison table
- Feature highlights with icons
- Call-to-action (GitHub, NPM, Get Started)
- Architecture diagram overview

### 2. Documentation Structure

```
/docs
├── /                           # Docs home
├── /getting-started            # Installation, setup, first steps
│   ├── /installation          # npm/pnpm/yarn install
│   ├── /quick-start           # First config in 5 minutes
│   └── /concepts              # Core concepts
├── /presets                   # Architecture presets
│   ├── /                      # Presets overview + comparison
│   ├── /hexagonal            # Hexagonal/Ports & Adapters
│   ├── /layered              # Layered/N-tier
│   ├── /clean                # Clean Architecture
│   ├── /modular              # Feature modules
│   ├── /nextjs               # Next.js patterns
│   └── /nestjs               # NestJS patterns
├── /configuration             # Config file reference
│   ├── /config-file          # .stricture/config.json
│   ├── /boundaries           # Boundary definitions
│   ├── /rules                # Rule syntax
│   └── /presets              # Using presets
├── /guides                    # How-to guides
│   ├── /custom-presets       # Creating custom presets
│   ├── /migration            # Migrating from other tools
│   ├── /monorepos            # Monorepo setup
│   └── /troubleshooting      # Common issues
├── /api                       # API documentation
│   ├── /core                 # @stricture/core
│   ├── /eslint-plugin        # @stricture/eslint-plugin
│   └── /cli                  # @stricture/cli
└── /examples                  # Real-world examples
    ├── /hexagonal-express    # Express.js hexagonal
    ├── /nextjs-app           # Next.js app
    └── /nestjs-api           # NestJS API
```

### 3. Interactive Components

**Preset Selector** (React Island):
- Interactive quiz/decision tree
- Questions about project type, team size, architecture goals
- Recommends preset based on answers
- Shows sample config and file structure
- Links to detailed preset documentation

**Diagram Viewer** (React Island):
- Renders Mermaid diagrams with zoom/pan
- Interactive node highlighting
- Toggle between different architecture views
- Export to SVG/PNG

**Code Playground** (Future):
- Live ESLint validation
- Try rules interactively
- See violations in real-time

### 4. Search

Starlight includes **Pagefind** search by default:
- Full-text search across all docs
- Keyboard shortcuts (Cmd+K / Ctrl+K)
- Instant client-side search (no server needed)
- Highlighted search results
- Fuzzy matching

### 5. Visual Design

**Diagrams**:
- Use Mermaid for all architecture diagrams
- Consistent theming across diagrams
- Color coding: layers, boundaries, dependencies
- Clean, simple, educational focus
- **NO ASCII art** - only Mermaid

**Code Blocks**:
- Syntax highlighting (Shiki)
- Copy button
- Line highlighting for emphasis
- Filename labels
- Multi-language support (TypeScript, JSON, bash)

**Callouts**:
- Info, Warning, Danger, Tip boxes
- Clear visual hierarchy
- Icons for quick scanning

## Implementation Structure

### Project Structure

```
apps/docs/
├── src/
│   ├── content/
│   │   ├── docs/                    # MDX documentation files
│   │   │   ├── index.mdx           # Docs home
│   │   │   ├── getting-started/
│   │   │   │   ├── installation.mdx
│   │   │   │   ├── quick-start.mdx
│   │   │   │   └── concepts.mdx
│   │   │   ├── presets/
│   │   │   │   ├── index.mdx       # Presets overview
│   │   │   │   ├── hexagonal.mdx
│   │   │   │   ├── layered.mdx
│   │   │   │   ├── clean.mdx
│   │   │   │   ├── modular.mdx
│   │   │   │   ├── nextjs.mdx
│   │   │   │   └── nestjs.mdx
│   │   │   ├── configuration/
│   │   │   │   ├── config-file.mdx
│   │   │   │   ├── boundaries.mdx
│   │   │   │   ├── rules.mdx
│   │   │   │   └── presets.mdx
│   │   │   ├── guides/
│   │   │   │   ├── custom-presets.mdx
│   │   │   │   ├── migration.mdx
│   │   │   │   ├── monorepos.mdx
│   │   │   │   └── troubleshooting.mdx
│   │   │   ├── api/
│   │   │   │   ├── core.mdx
│   │   │   │   ├── eslint-plugin.mdx
│   │   │   │   └── cli.mdx
│   │   │   └── examples/
│   │   │       ├── hexagonal-express.mdx
│   │   │       ├── nextjs-app.mdx
│   │   │       └── nestjs-api.mdx
│   │   └── config.ts                # Content collections config
│   ├── components/                   # Custom components
│   │   ├── PresetSelector.tsx       # React island (interactive)
│   │   ├── DiagramViewer.tsx        # React island (zoom/pan)
│   │   ├── CodeTabs.astro           # Tabbed code blocks
│   │   ├── ArchitectureDiagram.astro # Mermaid wrapper
│   │   └── FeatureGrid.astro        # Feature showcase
│   ├── pages/
│   │   └── index.astro              # Homepage (not in /docs)
│   └── styles/
│       └── custom.css               # Custom theme overrides
├── astro.config.mjs                  # Astro + Starlight config
├── tsconfig.json
└── package.json
```

### Starlight Configuration

**astro.config.mjs**:
```js
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://stricture.dev',
  integrations: [
    react(), // Enable React islands
    starlight({
      title: 'Stricture',
      description: 'Architecture boundaries for TypeScript projects',
      logo: {
        src: './src/assets/logo.svg',
      },
      social: {
        github: 'https://github.com/stricture-dev/stricture',
        npm: 'https://www.npmjs.com/package/@stricture/core',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', link: '/docs/getting-started/installation/' },
            { label: 'Quick Start', link: '/docs/getting-started/quick-start/' },
            { label: 'Core Concepts', link: '/docs/getting-started/concepts/' },
          ],
        },
        {
          label: 'Presets',
          items: [
            { label: 'Overview', link: '/docs/presets/' },
            { label: 'Hexagonal Architecture', link: '/docs/presets/hexagonal/' },
            { label: 'Layered Architecture', link: '/docs/presets/layered/' },
            { label: 'Clean Architecture', link: '/docs/presets/clean/' },
            { label: 'Modular Architecture', link: '/docs/presets/modular/' },
            { label: 'Next.js Patterns', link: '/docs/presets/nextjs/' },
            { label: 'NestJS Patterns', link: '/docs/presets/nestjs/' },
          ],
        },
        {
          label: 'Configuration',
          items: [
            { label: 'Config File', link: '/docs/configuration/config-file/' },
            { label: 'Boundaries', link: '/docs/configuration/boundaries/' },
            { label: 'Rules', link: '/docs/configuration/rules/' },
            { label: 'Using Presets', link: '/docs/configuration/presets/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Custom Presets', link: '/docs/guides/custom-presets/' },
            { label: 'Migration Guide', link: '/docs/guides/migration/' },
            { label: 'Monorepo Setup', link: '/docs/guides/monorepos/' },
            { label: 'Troubleshooting', link: '/docs/guides/troubleshooting/' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: '@stricture/core', link: '/docs/api/core/' },
            { label: '@stricture/eslint-plugin', link: '/docs/api/eslint-plugin/' },
            { label: '@stricture/cli', link: '/docs/api/cli/' },
          ],
        },
        {
          label: 'Examples',
          items: [
            { label: 'Hexagonal + Express', link: '/docs/examples/hexagonal-express/' },
            { label: 'Next.js App', link: '/docs/examples/nextjs-app/' },
            { label: 'NestJS API', link: '/docs/examples/nestjs-api/' },
          ],
        },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
      components: {
        // Override Starlight components if needed
      },
    }),
  ],
});
```

### Content Collections

**src/content/config.ts**:
```ts
import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
};
```

### MDX Frontmatter

Each MDX file includes frontmatter:
```yaml
---
title: Hexagonal Architecture
description: Learn how to enforce hexagonal architecture (ports & adapters) with Stricture
---
```

## Components Design

### React Islands (Interactive)

**PresetSelector.tsx**:
```tsx
// React component with client:load directive
// Interactive quiz with state management
// Recommends preset based on answers
// Shows live config preview
```

**DiagramViewer.tsx**:
```tsx
// React component for interactive Mermaid
// Zoom, pan, highlight nodes
// Export functionality
// Responsive design
```

### Astro Components (Static)

**ArchitectureDiagram.astro**:
```astro
<!-- Wrapper for Mermaid diagrams -->
<!-- Applies consistent theming -->
<!-- Adds captions and legends -->
```

**CodeTabs.astro**:
```astro
<!-- Tabbed code blocks (npm/pnpm/yarn) -->
<!-- Static generation -->
<!-- Clean UI -->
```

**FeatureGrid.astro**:
```astro
<!-- Grid of features with icons -->
<!-- Used on homepage and overview pages -->
```

## Dependencies

### Runtime

- **astro** (^4.15.0) - Astro framework
- **@astrojs/starlight** (^0.28.0) - Starlight docs theme
- **@astrojs/react** (^3.6.0) - React integration for islands
- **react** (^18.3.0) - React for interactive components
- **react-dom** (^18.3.0) - React DOM
- **@stricture/core** (workspace:*) - For live demos/playground

### Dev

- **typescript** (^5.3.0)
- **@stricture/typescript-config** (workspace:*)
- **@astrojs/check** (^0.9.0) - Type checking
- **prettier** (^3.3.0)
- **prettier-plugin-astro** (^0.14.0)

### Optional Enhancements

- **@astrojs/sitemap** - Sitemap generation
- **astro-seo** - Enhanced SEO meta tags
- **astro-compress** - Asset compression

## Performance

### Build Output

- **Static HTML** - Every page pre-rendered to HTML
- **Minimal JS** - Only ships JS for interactive islands (~10-20KB total)
- **CSS** - Scoped CSS, only loads what's needed per page
- **Images** - Optimized with Astro's built-in image optimization
- **Lazy Loading** - Interactive components load on demand

### Optimization Strategies

1. **Island Architecture** - Only hydrate interactive components
2. **Code Splitting** - Each island is a separate chunk
3. **Prerendering** - All routes generated at build time
4. **CDN-Ready** - Pure static files, deploy anywhere
5. **Caching** - Aggressive caching with content hashing

### Build Performance

- **Fast Builds** - Vite-powered, incremental compilation
- **Watch Mode** - Instant HMR during development
- **Parallel Rendering** - Multi-threaded page generation

## SEO

Starlight provides excellent SEO by default:

- **Meta Tags** - Auto-generated from frontmatter
- **OpenGraph** - Social media preview images
- **Sitemap** - Auto-generated XML sitemap
- **Robots.txt** - Configurable crawler instructions
- **Semantic HTML** - Proper heading hierarchy, landmarks
- **Structured Data** - JSON-LD for rich search results
- **Canonical URLs** - Prevent duplicate content
- **Fast Loading** - Core Web Vitals optimization

## Accessibility

Starlight is WCAG 2.1 AA compliant by default:

- **Keyboard Navigation** - Full keyboard support (Tab, Shift+Tab, Enter)
- **Screen Reader** - ARIA labels, semantic HTML, skip links
- **Focus Management** - Clear focus indicators, logical tab order
- **Color Contrast** - Meets WCAG AA standards (4.5:1 minimum)
- **Responsive Text** - Scales with user preferences
- **Reduced Motion** - Respects `prefers-reduced-motion`

## Deployment

### Supported Platforms

- **Cloudflare Pages** - Recommended (fast, free, edge deployment)
- **Netlify** - Great DX, automatic previews
- **Vercel** - Simple deployment, good analytics
- **GitHub Pages** - Free, integrated with GitHub
- **Any Static Host** - AWS S3, Azure Static Web Apps, etc.

### Build Command

```bash
pnpm build
```

Output: `dist/` directory with static HTML/CSS/JS

### Preview

```bash
pnpm preview
```

Serves the built site locally for testing.

## Development Workflow

### Local Development

```bash
pnpm dev
```

- Runs at `http://localhost:4321`
- Hot module reloading
- Fast refresh for content changes
- TypeScript checking in watch mode

### Content Authoring

1. Create/edit MDX files in `src/content/docs/`
2. Add frontmatter (title, description)
3. Use Mermaid for diagrams
4. Use Starlight components (Aside, Code, Tabs)
5. Preview changes in real-time

### Adding Interactive Components

1. Create React component in `src/components/`
2. Import in MDX with `client:load` directive
3. Component only hydrates on client (island)
4. Keep islands small and focused

## Visual Design System

### Color Palette

Starlight's default palette with custom overrides:

- **Primary** - Blue (#3b82f6) for links, CTAs
- **Accent** - Cyan (#06b6d4) for highlights
- **Success** - Green (#10b981) for allowed rules
- **Danger** - Red (#ef4444) for violations
- **Warning** - Yellow (#f59e0b) for warnings
- **Neutral** - Gray scale for text, backgrounds

### Typography

- **Headings** - System font stack (SF Pro, Segoe UI, Roboto)
- **Body** - Same as headings for consistency
- **Code** - JetBrains Mono (monospace, ligatures)
- **Scale** - Responsive type scale (1rem base, 1.25 ratio)

### Diagram Theme

Consistent Mermaid theme across all diagrams:

```javascript
%%{init: {'theme':'base', 'themeVariables': {
  'primaryColor':'#dbeafe',
  'primaryBorderColor':'#3b82f6',
  'secondaryColor':'#cffafe',
  'secondaryBorderColor':'#06b6d4',
  'tertiaryColor':'#d1fae5',
  'tertiaryBorderColor':'#10b981',
  'lineColor':'#6b7280',
  'textColor':'#1f2937'
}}}%%
```

- **Blue** - Domain/Core layers
- **Cyan** - Application/Use Cases
- **Green** - Adapters/Infrastructure
- **Arrows** - Gray for dependencies
- **Text** - Dark gray for readability

## Testing Strategy

### Content Validation

- **Broken Links** - Check all internal links during build
- **Code Examples** - Validate all code snippets compile
- **Mermaid Diagrams** - Ensure all diagrams render
- **Frontmatter** - Validate schema compliance

### Build Testing

```bash
pnpm build && pnpm preview
```

- Verify build completes without errors
- Check all routes accessible
- Test search functionality
- Validate responsive design
- Check accessibility (axe-core)

### Automated Checks

- **CI/CD** - Build on every commit
- **Lighthouse** - Performance, accessibility, SEO scores
- **Link Checker** - Weekly cron job for external links
- **Spell Check** - Basic spell checking in CI

## Future Enhancements

### Phase 2 (Post-Launch)

- **API Playground** - Live ESLint rule testing in browser
- **Interactive Examples** - Edit configs, see violations in real-time
- **Video Tutorials** - Embedded videos for complex topics
- **Community Examples** - User-submitted architecture examples
- **Blog** - Architecture best practices, release notes
- **Changelog** - Auto-generated from git commits
- **Newsletter** - Email updates for releases

### Phase 3 (Advanced)

- **Multi-language** - i18n support (Spanish, Chinese, etc.)
- **Versioned Docs** - Support for v1, v2, etc.
- **API Reference Generator** - Auto-generate from TypeScript types
- **Performance Monitoring** - Track Core Web Vitals
- **User Analytics** - Privacy-friendly analytics (Plausible)
- **Feedback Widget** - Inline documentation feedback

## Success Metrics

### Performance Targets

- **Lighthouse Score** - 100/100 (Performance, Accessibility, SEO)
- **First Contentful Paint** - < 1s
- **Time to Interactive** - < 2s
- **Total Bundle Size** - < 50KB JS (excluding islands)
- **Build Time** - < 30s for full site

### User Engagement

- **Search Usage** - Track search queries to improve content
- **Popular Pages** - Identify most-visited docs
- **Time on Page** - Measure content engagement
- **Bounce Rate** - < 40% for docs pages
- **Mobile Traffic** - > 30% mobile users

### Content Quality

- **Completeness** - All presets documented
- **Accuracy** - Code examples match actual behavior
- **Freshness** - Docs updated within 1 week of releases
- **Feedback** - User ratings on helpfulness
