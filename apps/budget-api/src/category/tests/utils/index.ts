import { Category } from '../../category.entity'
import { faker } from '@faker-js/faker'
import { TransactionType } from '../../../transaction/types'
import { userFactory } from '../../../user/tests/utlis'
import { CategoryId } from '../../types'

export const categoryFactory = (
  transactionType: TransactionType,
  quantity: number = 1,
  isDefault: boolean = true,
) => {
  if (quantity <= 0) {
    throw new Error('Quantity must be integer greater than zero')
  }

  const [user] = userFactory()
  const categories: Category[] = []

  for (let i = 0; i < quantity; i++) {
    const category: Category = {
      id: faker.string.uuid() as CategoryId,
      name: faker.word.noun(),
      isDefault,
      user,
      transactionType,
      transactions: [],
    }
    categories.push(category)
  }

  return categories
}
