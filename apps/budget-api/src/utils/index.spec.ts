import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './index'
import { faker } from '@faker-js/faker'

describe('hashPassword', () => {
  it('should creates a hashed password', async () => {
    const password = faker.internet.password()
    const passwordHash = await hashPassword(password)
    const [hash, salt] = passwordHash.split('.')

    expect(passwordHash).not.toEqual(password)
    expect(hash).toBeDefined()
    expect(hash).toHaveLength(64)
    expect(salt).toBeDefined()
    expect(salt).toHaveLength(16)
  })
})

describe('verifyPassword', () => {
  it('should validate the password correctly', async () => {
    const password = faker.internet.password()
    const passwordHash = await hashPassword(password)
    const incorrectPassword = faker.internet.password()

    const result = await verifyPassword(passwordHash, password)
    const result2 = await verifyPassword(passwordHash, incorrectPassword)

    expect(result).toEqual(true)
    expect(result2).toEqual(false)
  })
})
