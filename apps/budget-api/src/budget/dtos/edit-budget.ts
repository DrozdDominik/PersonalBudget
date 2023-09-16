import { IsNotEmpty, IsString } from 'class-validator'
import { Expose, Transform } from 'class-transformer'
import { BudgetId } from '../types'
import { UserId } from '../../user/types'

export class EditBudgetNameDto {
  @IsString()
  @IsNotEmpty()
  name: string
}

export class EditBudgetResponseDto {
  @Expose()
  id: BudgetId

  @Expose()
  name: string

  @Transform(({ obj }) => obj.owner.id)
  @Expose()
  ownerId: UserId
}
