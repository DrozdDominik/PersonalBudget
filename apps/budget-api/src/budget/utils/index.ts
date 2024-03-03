import { UserId } from '../../user/types'
import { User } from '../../user/user.entity'

export const isUserAmongBudgetUsers = (userId: UserId, budgetUsers: User[]): boolean =>
  budgetUsers.map(budgetUser => budgetUser.id).includes(userId)

export const deleteUserFromBudgetUsers = (userId: UserId, budgetUsers: User[]): User[] =>
  budgetUsers.filter(user => user.id !== userId)
