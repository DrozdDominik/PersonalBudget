import { faker } from '@faker-js/faker'
import { Budget } from '../../budget.entity'
import { BudgetId } from '../../types'
import { userFactory } from '../../../user/tests/utlis'

export const budgetFactory = (quantity: number = 1) => {
  if (quantity <= 0) {
    throw new Error('Quantity must be integer greater than zero')
  }

  const budgets: Budget[] = []

  const [user] = userFactory()

  for (let i = 0; i < quantity; i++) {
    const budget: Budget = {
      id: faker.string.uuid() as BudgetId,
      name: faker.word.noun(),
      owner: user,
      users: Promise.resolve([]),
      transactions: [],
    }
    budgets.push(budget)
  }

  return budgets
}
