# NestJS Layered Architecture Example

Example REST API built with NestJS using Layered Architecture, enforced by Stricture.

## Architecture Layers

```
Presentation Layer (Controllers)
    ↓
Business Logic Layer (Services)
    ↓
Data Access Layer (Repositories)
    ↓
Infrastructure Layer (Database, External APIs)
```

## Structure

```
src/
├── presentation/         # Controllers and DTOs
│   ├── controllers/
│   └── dto/
├── business/             # Business logic and services
│   └── services/
├── data/                 # Repositories and models
│   ├── repositories/
│   └── models/
└── infrastructure/       # Database, config, external clients
    ├── database/
    └── config/
```

## Running

```bash
pnpm install
pnpm dev
```

API available at http://localhost:3000

## Key Learnings

- Controllers only handle HTTP concerns
- Business logic isolated in service layer
- Data access abstracted through repositories
- Infrastructure details hidden from business layer

## License

MIT
