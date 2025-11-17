import { IsString, IsOptional, IsEnum } from 'class-validator'
import { Priority, TaskStatus } from '../../common/types'

/**
 * DTO for updating an existing task
 */
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus
}
