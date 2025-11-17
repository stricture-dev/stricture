import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

/**
 * Application bootstrap and composition root
 *
 * This is where the application starts and all modules are wired together.
 * NestJS handles dependency injection automatically based on module configuration.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform payloads to DTO instances
    }),
  )

  const port = process.env.PORT || 3000
  await app.listen(port)

  console.log(`🚀 Application is running on: http://localhost:${port}`)
  console.log(`📋 Tasks API: http://localhost:${port}/tasks`)
}

bootstrap()
