import { forwardRef, Module } from '@nestjs/common'
import { BudgetController } from './budget.controller'
import { BudgetService } from './budget.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Budget } from './budget.entity'
import { TransactionModule } from '../transaction/transaction.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [TypeOrmModule.forFeature([Budget]), forwardRef(() => TransactionModule), UserModule],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
