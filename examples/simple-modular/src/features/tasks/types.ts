/**
 * Task module types (private to this module)
 */

import type { ID, Timestamped } from '../../shared/types/common.js'

export interface Task extends Timestamped {
  id: ID
  title: string
  description: string
  completed: boolean
  assigneeId?: ID
}

export interface CreateTaskInput {
  title: string
  description: string
  assigneeId?: ID
}
