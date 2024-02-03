import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { BudgetService } from '../budget/budget.service'
import { TransactionService } from '../transaction/transaction.service'
import { BudgetId } from '../budget/types'
import { UserId } from '../user/types'
import { TransactionType } from '../transaction/types'
import { DateQueryParamsDto } from './dtos/date-query-params.dto'
import { Transaction } from '../transaction/transaction.entity'
import { ReportData } from './types'

@Injectable()
export class ReportService {
  constructor(
    @Inject(BudgetService) private budgetService: BudgetService,
    @Inject(BudgetService) private transactionService: TransactionService,
  ) {}

  async getReport(budgetId: BudgetId, userId: UserId): Promise<ReportData> {
    const budget = await this.budgetService.findBudgetWithTransactionsAndCategoriesByIdAndUserId(
      budgetId,
      userId,
    )

    if (!budget) {
      throw new NotFoundException('There is no such budget')
    }

    const transactions = budget.transactions

    return this.getReportData(transactions)
  }

  async getCustomRangeReport(
    budgetId: BudgetId,
    userId: UserId,
    range: DateQueryParamsDto,
  ): Promise<ReportData> {
    const budget = await this.budgetService.findBudgetWithTransactionsAndCategoriesByIdAndUserId(
      budgetId,
      userId,
    )

    if (!budget) {
      throw new NotFoundException('There is no such budget')
    }

    const transactions = budget.transactions

    const transactionsFromRange = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)

      return transactionDate >= new Date(range.start) && transactionDate <= new Date(range.end)
    })

    return this.getReportData(transactionsFromRange)
  }

  private getReportData(transactions: Transaction[]): ReportData {
    const incomes = transactions.filter(transaction => transaction.type === TransactionType.INCOME)
    const expenses = transactions.filter(
      transaction => transaction.type === TransactionType.EXPENSE,
    )

    const balance = transactions.reduce((previous, current) => {
      const amount =
        current.type === TransactionType.INCOME
          ? Number(current.amount)
          : Number(current.amount) * -1
      const temp = previous + amount
      return Math.round(temp * 100) / 100
    }, 0)

    return {
      incomes,
      expenses,
      balance,
    }
  }
}
