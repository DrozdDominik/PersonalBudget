import { Expose, Transform } from 'class-transformer';
import { BudgetId } from '../types';
import { UserId } from '../../user/types';
import { TransactionId } from '../../transaction/types';

export class GetBudgetDto {
  @Expose()
  id: BudgetId;

  @Expose()
  name: string;

  @Transform(({ obj }) => obj.owner.id)
  @Expose()
  owner: UserId;

  @Transform(({ obj }) => obj.users.map((user) => user.id))
  @Expose()
  users: UserId[];

  @Transform(({ obj }) => obj.transactions.map((transaction) => transaction.id))
  @Expose()
  transactions: TransactionId[];
}
