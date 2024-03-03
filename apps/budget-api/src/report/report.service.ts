import { Inject, Injectable } from '@nestjs/common'
import { BudgetService } from '../budget/budget.service'
import { BudgetId, SearchOptions } from '../budget/types'
import { UserId } from '../user/types'
import { TransactionType } from '../transaction/types'
import { Transaction } from '../transaction/transaction.entity'
import { ReportData } from './types'
import { DateRange } from '../types'

@Injectable()
export class ReportService {
  constructor(@Inject(BudgetService) private budgetService: BudgetService) {}

  async getReport(budgetId: BudgetId, userId: UserId, range: DateRange): Promise<ReportData> {
    const transactions = await this.budgetService.getBudgetTransactions(budgetId, userId, range)

    return transactions ? this.getReportData(transactions) : this.getReportData([])
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

  async getTransactionsBySearchOptions(
    budgetId: BudgetId,
    userId: UserId,
    searchOptions: SearchOptions,
  ): Promise<Transaction[]> {
    const transactions = await this.budgetService.getBudgetTransactionsBySearchOptions(
      budgetId,
      userId,
      searchOptions,
    )

    return transactions ? transactions : []
  }

  async getAllReports(userId: UserId, range: DateRange) {
    const budgets = await this.budgetService.getAllBudgetsWithTransactions(userId, range)

    return budgets.map(budget => {
      const reportData = this.getReportData(budget.transactions)
      return {
        name: budget.name,
        ...reportData,
      }
    })
  }
}
