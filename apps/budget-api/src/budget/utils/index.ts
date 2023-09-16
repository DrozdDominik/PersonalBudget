import { UserId } from '../../user/types'
import { User } from '../../user/user.entity'
import { BudgetWithUsers } from '../types'

export const isUserAmongBudgetUsers = (userId: UserId, budgetUsers: User[]): boolean =>
  budgetUsers.map(budgetUser => budgetUser.id).includes(userId)

export const filterBudgetsBySharedUserId = (
  budgets: BudgetWithUsers[],
  sharedUserId: UserId,
): BudgetWithUsers[] => budgets.filter(budget => isUserAmongBudgetUsers(sharedUserId, budget.users))

export const filterBudgetsByUserId = (
  budgets: BudgetWithUsers[],
  userId: UserId,
): BudgetWithUsers[] =>
  budgets.filter(
    budget => budget.owner.id === userId || isUserAmongBudgetUsers(userId, budget.users),
  )
