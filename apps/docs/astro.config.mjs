import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
  site: 'https://stricture.dev',
  integrations: [
    react(), // Enable React islands for interactive components
    mermaid(), // Enable Mermaid diagram support
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
            { label: 'Introduction', link: '/' },
            { label: 'Installation', link: '/getting-started/installation/' },
            { label: 'Quick Start', link: '/getting-started/quick-start/' },
            { label: 'Core Concepts', link: '/getting-started/concepts/' },
          ],
        },
        {
          label: 'Presets',
          items: [
            { label: 'Overview', link: '/presets/' },
            { label: 'Hexagonal Architecture', link: '/presets/hexagonal/' },
            { label: 'Layered Architecture', link: '/presets/layered/' },
            { label: 'Clean Architecture', link: '/presets/clean/' },
            { label: 'Modular Architecture', link: '/presets/modular/' },
            { label: 'Next.js Patterns', link: '/presets/nextjs/' },
            { label: 'NestJS Patterns', link: '/presets/nestjs/' },
          ],
        },
        {
          label: 'Configuration',
          items: [
            { label: 'Config File', link: '/configuration/config-file/' },
            { label: 'Boundaries', link: '/configuration/boundaries/' },
            { label: 'Rules', link: '/configuration/rules/' },
            { label: 'Using Presets', link: '/configuration/presets/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Custom Presets', link: '/guides/custom-presets/' },
            { label: 'Monorepo Setup', link: '/guides/monorepos/' },
            { label: 'Troubleshooting', link: '/guides/troubleshooting/' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: '@stricture/core', link: '/api/core/' },
            { label: '@stricture/eslint-plugin', link: '/api/eslint-plugin/' },
            { label: '@stricture/cli', link: '/api/cli/' },
          ],
        },
        {
          label: 'Examples',
          items: [
            { label: 'Hexagonal + Express', link: '/examples/hexagonal-express/' },
            { label: 'Next.js App', link: '/examples/nextjs-app/' },
            { label: 'NestJS API', link: '/examples/nestjs-api/' },
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
