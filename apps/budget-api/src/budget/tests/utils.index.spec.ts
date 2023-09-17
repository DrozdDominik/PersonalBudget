import { describe, expect, it } from 'vitest'
import { userFactory } from '../../user/tests/utlis'
import { deleteUserFromBudgetUsers, isUserAmongBudgetUsers } from '../utils'
import { faker } from '@faker-js/faker'
import { UserId } from '../../user/types'

const users = userFactory(5)

describe('isUserAmongBudgetUsers', () => {
  it('should returns true if userId belongs to any user from users array', () => {
    const userIdToCheck = users[2].id
    const result = isUserAmongBudgetUsers(userIdToCheck, users)

    expect(result).toBe(true)
  })

  it('should returns false if userId not belongs to any user from users array', () => {
    const userIdToCheck = faker.string.uuid() as UserId
    const result = isUserAmongBudgetUsers(userIdToCheck, users)

    expect(result).toBe(false)
  })
})

describe('deleteUserFromBudgetUsers', () => {
  it('should removed user with provided userId from users array', () => {
    const userIdToDelete = users[2].id

    const ifUserBelongsToArrayBefore = isUserAmongBudgetUsers(userIdToDelete, users)
    const result = deleteUserFromBudgetUsers(userIdToDelete, users)
    const ifUserBelongsToArrayAfter = isUserAmongBudgetUsers(userIdToDelete, result)

    expect(ifUserBelongsToArrayBefore).toBe(true)
    expect(result.length).toBe(users.length - 1)
    expect(ifUserBelongsToArrayAfter).toBe(false)
  })
})
