import { IsUUID } from 'class-validator'
import { BudgetId } from '../types'
import { UserId } from '../../user/types'
import { Expose, Transform } from 'class-transformer'

export class ShareBudgetDto {
  @IsUUID()
  budgetId: BudgetId

  @IsUUID()
  userId: UserId
}

export class ShareBudgetResponseDto {
  @Expose()
  id: BudgetId

  @Transform(({ obj }) => obj.users.map(user => user.id))
  @Expose()
  users: UserId[]
}