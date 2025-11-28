import ArchitectureDiagram from './ArchitectureDiagram';

export default function LayeredDiagram() {
  const boundaries = [
    {
      name: 'presentation',
      pattern: 'src/presentation/**',
      description: 'UI, controllers, views, CLI',
      layer: 0,
      color: '#e3f2fd',
      folder: 'src/presentation',
      files: ['controllers/user-controller.ts', 'views/user-view.tsx', 'cli/commands.ts'],
    },
    {
      name: 'application',
      pattern: 'src/application/**',
      description: 'Services & use cases',
      layer: 1,
      color: '#f3e5f5',
      folder: 'src/application',
      files: ['services/user-service.ts', 'use-cases/create-user.ts'],
    },
    {
      name: 'domain',
      pattern: 'src/domain/**',
      description: 'Business logic & entities',
      layer: 2,
      color: '#e8f5e9',
      folder: 'src/domain',
      files: ['entities/user.ts', 'services/user-domain-service.ts'],
    },
    {
      name: 'infrastructure',
      pattern: 'src/infrastructure/**',
      description: 'Data access & external systems',
      layer: 3,
      color: '#fff3e0',
      folder: 'src/infrastructure',
      files: ['repositories/user-repository.ts', 'database/connection.ts', 'external/email-client.ts'],
    },
  ];

  const connections = [
    // Presentation to application
    { from: 'presentation', to: 'application' },
    { from: 'presentation', to: 'domain' },
    { from: 'presentation', to: 'infrastructure' },

    // Application to domain and infrastructure
    { from: 'application', to: 'domain' },
    { from: 'application', to: 'infrastructure' },

    // Domain to infrastructure
    { from: 'domain', to: 'infrastructure' },

    // Infrastructure to domain
    { from: 'infrastructure', to: 'domain' },
  ];

  return (
    <ArchitectureDiagram
      pattern="layered"
      boundaries={boundaries}
      connections={connections}
      defaultLevel="minimal"
    />
  );
}
