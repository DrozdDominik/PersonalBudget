import { Expose, Transform } from 'class-transformer'

export class ReportResponse {
  @Transform(({ obj }) =>
    obj.incomes.map(income => ({
      amount: income.amount,
      date: income.date,
      comment: income.comment,
      category: income.category.name,
      user: income.user.name,
    })),
  )
  @Expose()
  incomes: {
    amount: number
    date: string
    comment: string | null
    category: string
    user: string
  }[]

  @Transform(({ obj }) =>
    obj.expenses.map(expense => ({
      amount: expense.amount,
      date: expense.date,
      comment: expense.comment,
      category: expense.category.name,
      user: expense.user.name,
    })),
  )
  @Expose()
  expenses: {
    amount: number
    date: string
    comment: string | null
    category: string
    user: string
  }[]

  @Expose()
  balance: number
}

export class BudgetReportResponse extends ReportResponse {
  constructor() {
    super()
  }

  @Expose()
  name: string
}
