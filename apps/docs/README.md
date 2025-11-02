# Stricture Documentation Site

Official documentation website for Stricture at **stricture.dev**.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **MDX** for documentation content
- **React** components for interactive features

## Development

```bash
pnpm dev
```

Visit http://localhost:3000

## Content Structure

```
app/
├── page.tsx                 # Homepage
├── docs/
│   ├── getting-started/
│   ├── presets/
│   ├── configuration/
│   ├── api/
│   └── examples/
├── blog/                    # Blog posts (optional)
└── api/                     # API routes

content/
├── docs/                    # MDX documentation files
│   ├── getting-started.mdx
│   ├── presets/
│   │   ├── hexagonal.mdx
│   │   ├── layered.mdx
│   │   ├── modular.mdx
│   │   └── clean.mdx
│   └── ...
└── blog/

components/
├── docs/                    # Documentation-specific components
│   ├── mdx-components.tsx
│   ├── code-block.tsx
│   ├── callout.tsx
│   └── ...
├── preset-selector.tsx      # Interactive preset selector
└── diagram-viewer.tsx       # Architecture diagram viewer
```

## Key Pages

- **/** - Homepage with quick start
- **/docs** - Documentation hub
- **/docs/getting-started** - Getting started guide
- **/docs/presets** - Architecture presets overview
- **/docs/presets/[preset]** - Individual preset docs
- **/docs/configuration** - Configuration reference
- **/docs/api** - API documentation
- **/examples** - Code examples
- **/blog** - Blog posts (optional)

## Features

- 🔍 Search functionality
- 🌙 Dark mode
- 📱 Mobile responsive
- 🎨 Syntax highlighting
- 📊 Interactive diagrams
- 🎯 Preset comparison tool
- 📚 API documentation
- 🔗 Deep linking

## Build

```bash
pnpm build
```

Output in `.next/`

## Deploy

Deploy to Vercel:

```bash
vercel
```

## License

MIT
