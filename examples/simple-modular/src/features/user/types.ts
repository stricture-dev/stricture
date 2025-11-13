/**
 * User module types (private to this module)
 */

import type { ID, Timestamped } from '../../shared/types/common.js'

export interface User extends Timestamped {
  id: ID
  name: string
  email: string
}

export interface CreateUserInput {
  name: string
  email: string
}
