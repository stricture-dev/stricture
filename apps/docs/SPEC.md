# @stricture/docs - Technical Specification

## Overview

Documentation website for Stricture built with Next.js 14 App Router, serving as the central hub for guides, API docs, and examples.

## Responsibilities

- Serve documentation content from MDX files
- Provide interactive preset selector
- Display architecture diagrams
- Offer code examples with syntax highlighting
- Search functionality
- Dark mode support
- Mobile-responsive design
- SEO optimization

## Key Features

### 1. Homepage

- Hero section with value proposition
- Quick start guide
- Preset comparison table
- Feature highlights
- Call-to-action (GitHub, NPM)

### 2. Documentation

- **Getting Started** - Installation, setup, first steps
- **Presets** - Detailed guides for each architecture preset
- **Configuration** - Config file reference
- **API** - API documentation for all packages
- **Examples** - Real-world usage examples
- **Guides** - How-to guides and best practices

### 3. Interactive Components

**Preset Selector**:
- Interactive quiz/selector
- Shows recommended preset based on answers
- Links to detailed documentation

**Diagram Viewer**:
- Renders Mermaid diagrams
- Interactive exploration
- Zoom and pan

**Code Playground**:
- Live ESLint validation (future)
- Try rules interactively

### 4. Search

- Full-text search across docs
- Keyboard shortcuts (Cmd+K)
- Quick navigation

## Implementation Approach

### Content Management

MDX files in `content/docs/` directory:
```
content/
├── docs/
│   ├── index.mdx
│   ├── getting-started.mdx
│   ├── presets/
│   │   ├── index.mdx
│   │   ├── hexagonal.mdx
│   │   ├── layered.mdx
│   │   ├── modular.mdx
│   │   ├── clean.mdx
│   │   ├── nextjs.mdx
│   │   └── nestjs.mdx
│   ├── configuration.mdx
│   └── api/
│       ├── core.mdx
│       ├── eslint-plugin.mdx
│       └── cli.mdx
```

### App Router Structure

```
app/
├── layout.tsx              # Root layout with nav
├── page.tsx                # Homepage
├── docs/
│   ├── layout.tsx          # Docs layout with sidebar
│   ├── page.tsx            # Docs hub
│   └── [...slug]/
│       └── page.tsx        # Dynamic doc pages
├── examples/
│   └── page.tsx
└── api/
    └── search/
        └── route.ts        # Search API
```

### Components

```
components/
├── layout/
│   ├── header.tsx
│   ├── footer.tsx
│   ├── sidebar.tsx
│   └── mobile-menu.tsx
├── docs/
│   ├── mdx-components.tsx  # Custom MDX components
│   ├── code-block.tsx      # Syntax-highlighted code
│   ├── callout.tsx         # Info/warning/error boxes
│   ├── tabs.tsx            # Tabbed content
│   └── table-of-contents.tsx
├── preset-selector.tsx
├── diagram-viewer.tsx
├── search.tsx
└── theme-toggle.tsx
```

## Dependencies

### Runtime

- **next** (^14.1.0) - Next.js framework
- **react** (^18.2.0)
- **react-dom** (^18.2.0)
- **next-mdx-remote** (^4.4.1) - MDX rendering
- **gray-matter** (^4.0.3) - Frontmatter parsing
- **prism-react-renderer** (^2.3.1) - Syntax highlighting
- **@stricture/core** (workspace:*) - For live demos

### Dev

- **typescript** (^5.3.0)
- **tailwindcss** (^3.4.0)
- **@stricture/typescript-config** (workspace:*)
- **eslint-config-next** (^14.1.0)

## Performance

- Static generation where possible
- Image optimization (Next.js Image)
- Code splitting
- Lazy loading for interactive components
- CDN deployment (Vercel)

## SEO

- Meta tags for all pages
- OpenGraph images
- Sitemap generation
- Robots.txt
- Structured data (JSON-LD)

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader friendly
- Focus indicators
- Semantic HTML

## Future Enhancements

- API playground (live editing)
- Video tutorials
- Community examples
- Blog with RSS
- Changelog
- Newsletter signup
