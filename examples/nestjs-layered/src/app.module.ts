import { Module } from '@nestjs/common'
import { TasksModule } from './tasks/tasks.module'

/**
 * Root application module
 *
 * Imports all feature modules and configures the application.
 */
@Module({
  imports: [TasksModule],
})
export class AppModule {}
