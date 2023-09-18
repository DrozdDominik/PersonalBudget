import { Test, TestingModule } from '@nestjs/testing'
import { BudgetService } from '../budget.service'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BudgetController } from '../budget.controller'
import { UserService } from '../../user/user.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Budget } from '../budget.entity'
import { Repository } from 'typeorm'
import { User } from '../../user/user.entity'
import { faker } from '@faker-js/faker'
import { userFactory } from '../../user/tests/utlis'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { BudgetId, BudgetWithUsers } from '../types'
import { UserId, UserRole } from '../../user/types'

describe('BudgetService', () => {
  let service: BudgetService
  let repo: Repository<Budget>
  let userService: UserService

  const [owner] = userFactory()

  const [admin] = userFactory(1, UserRole.Admin)

  const users = userFactory(3)

  const budget: Budget = {
    id: faker.string.uuid() as BudgetId,
    name: faker.word.noun(),
    owner,
    users: Promise.resolve(users),
    transactions: [],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [
        BudgetService,
        UserService,
        {
          provide: getRepositoryToken(Budget),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            findOne: vi.fn(),
            delete: vi.fn(),
            find: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<BudgetService>(BudgetService)

    repo = module.get<Repository<Budget>>(getRepositoryToken(Budget))

    userService = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Create method', () => {
    const name = faker.word.noun()
    const dataToSave = {
      name,
      owner,
    }

    it('should call budgetRepository.create method with correct data', async () => {
      vi.spyOn(service, 'findBudgetByOwnerAndName').mockResolvedValueOnce(null)

      await service.create(name, owner)

      expect(repo.create).toHaveBeenCalledWith(dataToSave)
    })

    it('should throw error if budget with provided name already exists', async () => {
      vi.spyOn(service, 'findBudgetByOwnerAndName').mockResolvedValueOnce(budget)

      await expect(service.create(name, owner)).rejects.toThrowError(BadRequestException)
    })
  })

  describe('Get method', () => {
    it('should returns budget with users field', async () => {
      const id = budget.id
      const expectedResult: BudgetWithUsers = {
        id: budget.id,
        name: budget.name,
        owner: budget.owner,
        users,
        transactions: budget.transactions,
      }

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)

      const result = await service.get(id, owner)

      expect(result).toStrictEqual(expectedResult)
    })

    it('should throw error if budget there is no budget with provided id', async () => {
      const id = faker.string.uuid() as BudgetId

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(null)

      await expect(service.get(id, owner)).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if budget belongs to another user and current user has not admin role', async () => {
      const id = faker.string.uuid() as BudgetId
      const [owner] = userFactory()

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)

      await expect(service.get(id, owner)).rejects.toThrowError(ForbiddenException)
    })

    it('should returns budget with users field if budget belongs to another user but current user has admin role', async () => {
      const id = budget.id
      const expectedResult: BudgetWithUsers = {
        id: budget.id,
        name: budget.name,
        owner: budget.owner,
        users,
        transactions: budget.transactions,
      }

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)

      const result = await service.get(id, admin)

      expect(result).toStrictEqual(expectedResult)
    })

    it('should returns budget with users field if budget is shared to current user', async () => {
      const id = budget.id
      const user = users[0]

      const expectedResult: BudgetWithUsers = {
        id: budget.id,
        name: budget.name,
        owner: budget.owner,
        users,
        transactions: budget.transactions,
      }

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)

      const result = await service.get(id, user)

      expect(result).toStrictEqual(expectedResult)
    })
  })

  describe('checkUserAccessToBudget method', () => {
    it('should return null if there is no budget with provided id', async () => {
      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(null)

      const userId = faker.string.uuid() as UserId
      const budgetId = budget.id

      const result = await service.checkUserAccessToBudget(budgetId, userId)

      expect(result).toBeNull()
    })

    it('should return null if user with provided id have no access to budget with provided id', async () => {
      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)

      const userId = faker.string.uuid() as UserId
      const budgetId = budget.id

      const result = await service.checkUserAccessToBudget(budgetId, userId)

      expect(result).toBeNull()
    })

    it('should return budget if user with provided id is owner', async () => {
      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)

      const userId = budget.owner.id
      const budgetId = budget.id

      const result = await service.checkUserAccessToBudget(budgetId, userId)

      expect(result).toStrictEqual(budget)
    })

    it('should return budget if user with provided id is one of shared users', async () => {
      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)

      const users = await budget.users
      const userId = users[1].id
      const budgetId = budget.id

      const result = await service.checkUserAccessToBudget(budgetId, userId)

      expect(result).toStrictEqual(budget)
    })
  })

  describe('addUser method', () => {
    it('should throw error if there is no budget with provided id', async () => {
      const budgetId = faker.string.uuid() as BudgetId
      const ownerId = owner.id
      const newUserId = users[1].id

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(null)

      await expect(service.addUser(budgetId, ownerId, newUserId)).rejects.toEqual(
        new NotFoundException('Budget not found'),
      )
    })

    it('should throw error if user is not owner of budget with provided id', async () => {
      const budgetId = budget.id
      const ownerId = faker.string.uuid() as UserId
      const newUserId = users[1].id

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)

      await expect(service.addUser(budgetId, ownerId, newUserId)).rejects.toEqual(
        new ForbiddenException('Not your budget'),
      )
    })

    it('should throw error if owner id is equal user id', async () => {
      const budgetId = budget.id
      const ownerId = budget.owner.id
      const newUserId = ownerId

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)

      await expect(service.addUser(budgetId, ownerId, newUserId)).rejects.toEqual(
        new BadRequestException('Cannot share budget with yourself'),
      )
    })

    it('should throw error if there is no user with provided id', async () => {
      const budgetId = budget.id
      const ownerId = budget.owner.id
      const newUserId = faker.string.uuid() as UserId

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)
      vi.spyOn(userService, 'findOneById').mockResolvedValueOnce(null)

      await expect(service.addUser(budgetId, ownerId, newUserId)).rejects.toEqual(
        new NotFoundException('User not found'),
      )
    })

    it('should throw error if user already has access there is no user with provided id', async () => {
      const budgetId = budget.id
      const ownerId = budget.owner.id
      const newUser = users[1]

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)
      vi.spyOn(userService, 'findOneById').mockResolvedValueOnce(newUser)

      await expect(service.addUser(budgetId, ownerId, newUser.id)).rejects.toEqual(
        new BadRequestException('Already has access'),
      )
    })

    it('should returns correct data', async () => {
      const budgetId = budget.id
      const ownerId = budget.owner.id
      const [newUser] = userFactory()
      const users = await budget.users
      const expectedResult = {
        ...budget,
        users: [...users, newUser],
      }

      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)
      vi.spyOn(userService, 'findOneById').mockResolvedValueOnce(newUser)
      vi.spyOn(repo, 'save')

      const result = await service.addUser(budgetId, ownerId, newUser.id)

      expect(repo.save).toHaveBeenCalledOnce()
      expect(result).toStrictEqual(expectedResult)
    })
  })
})
