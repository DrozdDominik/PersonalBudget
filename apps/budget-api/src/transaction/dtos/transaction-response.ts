import { Expose, Transform } from 'class-transformer'
import { UserId } from '../../user/types'
import { TransactionId, TransactionType } from '../types'
import { BudgetId } from '../../budget/types'

export class TransactionResponse {
  @Expose()
  id: TransactionId

  @Expose()
  type: TransactionType

  @Transform(({ obj }) => obj.category.name)
  @Expose()
  category: string

  @Expose()
  amount: number

  @Expose()
  date: string

  @Expose()
  comment: string | null

  @Transform(({ obj }) => obj.user.id)
  @Expose()
  userId: UserId

  @Transform(({ obj }) => obj.budget.id)
  @Expose()
  budgetId: BudgetId
}
