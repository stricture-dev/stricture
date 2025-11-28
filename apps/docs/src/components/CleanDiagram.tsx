import ArchitectureDiagram from './ArchitectureDiagram';

export default function CleanDiagram() {
  const boundaries = [
    {
      name: 'entities',
      pattern: 'src/entities/**',
      description: 'Enterprise business rules',
      layer: 0,
      color: '#c8e6c9',
      folder: 'src/entities',
      files: ['order.ts', 'user.ts', 'value-objects/money.ts'],
    },
    {
      name: 'use-cases',
      pattern: 'src/use-cases/**',
      description: 'Application business rules',
      layer: 1,
      color: '#b3e5fc',
      folder: 'src/use-cases',
      files: ['create-order/create-order.ts', 'get-user/get-user.ts'],
    },
    {
      name: 'interface-adapters',
      pattern: 'src/interface-adapters/**',
      description: 'Controllers, gateways, presenters',
      layer: 2,
      color: '#fff9c4',
      folder: 'src/interface-adapters',
      files: ['controllers/order-controller.ts', 'presenters/order-presenter.ts', 'gateways/order-gateway.ts'],
    },
    {
      name: 'frameworks-drivers',
      pattern: 'src/frameworks-drivers/**',
      description: 'Web, database, external interfaces',
      layer: 3,
      color: '#ffccbc',
      folder: 'src/frameworks-drivers',
      files: ['web/express-server.ts', 'database/postgres.ts', 'external/email-client.ts'],
    },
  ];

  const connections = [
    // Frameworks to interface adapters
    { from: 'frameworks-drivers', to: 'interface-adapters' },

    // Interface adapters to use cases
    { from: 'interface-adapters', to: 'use-cases' },

    // Use cases to entities
    { from: 'use-cases', to: 'entities' },

    // Entities self-imports
    { from: 'entities', to: 'entities' },
  ];

  return (
    <ArchitectureDiagram
      pattern="clean"
      boundaries={boundaries}
      connections={connections}
      defaultLevel="minimal"
    />
  );
}
