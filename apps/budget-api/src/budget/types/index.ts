import { Budget } from '../budget.entity'
import { User } from '../../user/user.entity'
import { TransactionType } from '../../transaction/types'
import { DateRange } from '../../types'

export type BudgetId = string & { __BudgetId__: void }

export type BudgetWithUsers = Omit<Budget, 'users'> & { users: User[] }

export type SearchOptions = {
  type: TransactionType
  category?: string
  dateRange?: DateRange
}
