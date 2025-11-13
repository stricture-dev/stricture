/**
 * Tasks Module - Public API
 *
 * This is the ONLY file other modules should import from.
 * All other files in this module are private implementation details.
 */

export { TaskService } from './task-service.js'
export type { Task, CreateTaskInput } from './types.js'
