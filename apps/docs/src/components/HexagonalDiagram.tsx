import ArchitectureDiagram from './ArchitectureDiagram';

export default function HexagonalDiagram() {
  const boundaries = [
    {
      name: 'domain',
      pattern: 'src/core/domain/**',
      description: 'Pure business logic',
      layer: 0,
      color: '#c8e6c9',
      folder: 'src/core/domain',
      files: ['user.ts', 'order.ts', 'value-objects/email.ts'],
    },
    {
      name: 'ports',
      pattern: 'src/core/ports/**',
      description: 'Interface definitions',
      layer: 1,
      color: '#e1bee7',
      folder: 'src/core/ports',
      files: ['user-repository.ts', 'email-service.ts'],
    },
    {
      name: 'application',
      pattern: 'src/core/application/**',
      description: 'Use cases & orchestration',
      layer: 2,
      color: '#b3d9ff',
      folder: 'src/core/application',
      files: ['create-user.ts', 'get-user.ts'],
    },
    {
      name: 'driving-adapters',
      pattern: 'src/adapters/driving/**',
      description: 'Entry points (CLI, HTTP, GraphQL)',
      layer: 3,
      color: '#ffe6cc',
      folder: 'src/adapters/driving',
      files: ['cli/handler.ts', 'http/controller.ts', 'graphql/resolver.ts'],
    },
    {
      name: 'driven-adapters',
      pattern: 'src/adapters/driven/**',
      description: 'Implementations (Repositories, APIs)',
      layer: 3,
      color: '#ffccbc',
      folder: 'src/adapters/driven',
      files: ['postgres/repository.ts', 'email/sendgrid.ts'],
    },
  ];

  const connections = [
    // Driving adapters to application
    { from: 'driving-adapters', to: 'application' },
    { from: 'driving-adapters', to: 'ports' },

    // Application to domain and ports
    { from: 'application', to: 'domain' },
    { from: 'application', to: 'ports' },

    // Ports to domain
    { from: 'ports', to: 'domain' },

    // Driven adapters to ports and domain
    { from: 'driven-adapters', to: 'ports' },
    { from: 'driven-adapters', to: 'domain' },

    // Domain self-imports
    { from: 'domain', to: 'domain' },
  ];

  return (
    <ArchitectureDiagram
      pattern="hexagonal"
      boundaries={boundaries}
      connections={connections}
      defaultLevel="minimal"
    />
  );
}
