# NestJS Layered Example - Specification

## Overview

REST API for task management built with NestJS using strict layered architecture.

## Features

- User management (CRUD)
- Task management (CRUD)
- Authentication (JWT)
- Task assignment
- Task filtering and search

## Layers

1. **Presentation** - Controllers, DTOs, request/response handling
2. **Business** - Services, business rules, validation
3. **Data** - Repositories, database queries
4. **Infrastructure** - TypeORM, JWT, config

## Endpoints

- `POST /auth/login` - Authenticate user
- `GET /users` - List users
- `POST /users` - Create user
- `GET /tasks` - List tasks
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

## Testing

- Unit tests for services
- Integration tests for controllers
- E2E tests for full flows
