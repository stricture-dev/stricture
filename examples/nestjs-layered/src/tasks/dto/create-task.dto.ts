import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator'
import { Priority } from '../../common/types'

/**
 * DTO for creating a new task
 *
 * Note: This is intentionally independent of the Task entity.
 * DTOs define the API contract, entities define the data model.
 * This separation allows them to evolve independently.
 */
export class CreateTaskDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title!: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(Priority, { message: 'Priority must be low, medium, or high' })
  priority!: Priority
}
