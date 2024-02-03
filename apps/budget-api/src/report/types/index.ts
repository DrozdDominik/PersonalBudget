import { Transaction } from '../../transaction/transaction.entity'

export type ReportData = {
  incomes: Transaction[]
  expenses: Transaction[]
  balance: number
}
