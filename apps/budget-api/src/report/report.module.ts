import { Module } from '@nestjs/common'
import { ReportService } from './report.service'
import { ReportController } from './report.controller'
import { BudgetModule } from '../budget/budget.module'
import { TransactionModule } from '../transaction/transaction.module'

@Module({
  imports: [BudgetModule, TransactionModule],
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {}
