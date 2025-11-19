import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://stricture.dev',
  integrations: [
    react(), // Enable React islands for interactive components
    starlight({
      title: 'Stricture',
      description: 'Architecture boundaries for TypeScript projects',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
      },
      social: {
        github: 'https://github.com/stricture-dev/stricture',
      },
      editLink: {
        baseUrl: 'https://github.com/stricture-dev/stricture/edit/main/apps/docs/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/docs/' },
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
      head: [
        // Add custom tags to <head>
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://stricture.dev/og-image.png',
          },
        },
      ],
    }),
    sitemap(),
  ],
});
