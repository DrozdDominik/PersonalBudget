import { Transaction } from '../../transaction.entity'
import { faker } from '@faker-js/faker'
import { UserId } from '../../../user/types'
import { TransactionId, TransactionType } from '../../types'
import { categoryFactory } from '../../../category/tests/utils'
import { userFactory } from '../../../user/tests/utlis'
import { budgetFactory } from '../../../budget/tests/utils'

export const transactionFactory = (
  quantity: number,
  type: TransactionType,
  userId: UserId | null = null,
): Transaction[] => {
  if (quantity <= 0) {
    throw new Error('Quantity must be integer greater than zero')
  }

  const [category] = categoryFactory(TransactionType.INCOME)
  const [user] = userFactory()
  const [budget] = budgetFactory()
  const transactions: Transaction[] = []

  if (!!userId) {
    user.id = userId
  }

  for (let i = 0; i < quantity; i++) {
    const transaction: Transaction = {
      id: faker.string.uuid() as TransactionId,
      type,
      amount: faker.number.float({ min: 0, max: 1000000, fractionDigits: 2 }),
      date: faker.date.anytime(),
      comment: null,
      category,
      user,
      budget,
    }

    transactions.push(transaction)
  }

  return transactions
}
