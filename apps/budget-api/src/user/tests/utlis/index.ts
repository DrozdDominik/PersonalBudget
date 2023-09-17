import { User } from '../../user.entity'
import { faker } from '@faker-js/faker'
import { UserRole } from '../../types'

export const userFactory = (quantity: number = 1, role: UserRole = UserRole.User) => {
  if (quantity <= 0) {
    throw new Error('Quantity must be integer greater than zero')
  }

  const users: User[] = []

  for (let i = 0; i < quantity; i++) {
    const user = {
      id: faker.string.uuid(),
      name: faker.internet.userName(),
      email: faker.internet.email(),
      passwordHash: faker.internet.password(),
      currentToken: null,
      role,
      transactions: [],
      categories: [],
      ownBudgets: [],
    } as User
    users.push(user)
  }

  return users
}
