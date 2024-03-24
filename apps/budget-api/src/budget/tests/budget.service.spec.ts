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
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { BudgetId } from '../types'
import { UserId } from '../../user/types'

describe('BudgetService', () => {
  let service: BudgetService
  let repo: Repository<Budget>
  let userService: UserService

  const [owner] = userFactory()

  const users = userFactory(3)

  const budget: Budget = {
    id: faker.string.uuid() as BudgetId,
    name: faker.word.noun(),
    owner,
    users: users,
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
      vi.spyOn(repo, 'save').mockResolvedValueOnce(budget)

      await service.create(name, owner)

      expect(repo.create).toHaveBeenCalledWith(dataToSave)
    })

    it('should throw error if budget with provided name already exists', async () => {
      vi.spyOn(service, 'findBudgetByOwnerAndName').mockResolvedValueOnce(budget)

      await expect(service.create(name, owner)).rejects.toThrowError(BadRequestException)
    })
  })

  describe('delete method', () => {
    it('should throw error if there is no budget with provided id', async () => {
      const budgetId = faker.string.uuid() as BudgetId
      const user = owner
      vi.spyOn(service, 'findBudgetById').mockRejectedValueOnce(new NotFoundException())

      await expect(service.delete(budgetId, user)).rejects.toThrowError(NotFoundException)
    })

    it('should call budgetRepository with correct budget id when budgetId and correct ownerId are provided', async () => {
      const budgetId = budget.id
      const user = owner
      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({ raw: [], affected: 1 })

      await service.delete(budgetId, user)

      expect(repo.delete).toHaveBeenCalledWith(budget.id)
    })
  })

  describe('removeUser method', () => {
    it('should throw error if there is no budget with provided budgetId and ownerId', async () => {
      const budgetId = budget.id
      const budgetUsers = budget.users
      const userId = budgetUsers[0].id
      vi.spyOn(service, 'findBudgetByIdAndOwner').mockRejectedValue(new NotFoundException())

      await expect(service.removeUser(budgetId, owner.id, userId)).rejects.toThrowError(
        NotFoundException,
      )
    })

    it('should throw error if budget users do not contain user with provided userId', async () => {
      const budgetId = budget.id
      const userId = faker.string.uuid() as UserId
      vi.spyOn(service, 'findBudgetByIdAndOwner').mockResolvedValueOnce(budget)

      vi.spyOn(userService, 'findUser').mockRejectedValue(new NotFoundException())

      await expect(service.removeUser(budgetId, owner.id, userId)).rejects.toThrowError(
        NotFoundException,
      )
    })

    it('should call budgetRepository save method with correct data', async () => {
      const budgetId = budget.id
      const userId = users[0].id
      const usersAfterRemoveUser = users.filter(user => user.id !== userId)
      const budgetAfterRemoveUser = {
        ...budget,
        users: usersAfterRemoveUser,
      }

      vi.spyOn(service, 'findBudgetByIdAndOwner').mockResolvedValueOnce(budget)
      vi.spyOn(userService, 'findUser').mockResolvedValueOnce(users[0])
      vi.spyOn(repo, 'save').mockResolvedValueOnce(budget)

      await service.removeUser(budgetId, owner.id, userId)

      expect(repo.save).toHaveBeenCalledWith(budgetAfterRemoveUser)
    })
  })

  describe('editName method', () => {
    it('should throw error if there is budget with same name', async () => {
      const budgetId = faker.string.uuid() as BudgetId
      const newName = faker.word.noun()

      vi.spyOn(service, 'findBudgetByOwnerAndName').mockResolvedValueOnce(budget)
      vi.spyOn(repo, 'save').mockResolvedValueOnce(budget)

      await expect(service.editName(budgetId, owner.id, newName)).rejects.toThrowError(
        BadRequestException,
      )
    })

    it('should throw error if there is no budget with provided id', async () => {
      const budgetId = faker.string.uuid() as BudgetId
      const newName = faker.word.noun()

      vi.spyOn(service, 'findBudgetByOwnerAndName').mockResolvedValueOnce(null)
      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(null)

      await expect(service.editName(budgetId, owner.id, newName)).rejects.toThrowError(
        NotFoundException,
      )
    })

    it('should call budgetRepository save method with correct data', async () => {
      const budgetId = budget.id
      const newName = faker.word.noun()
      const budgetAfterEditName = {
        ...budget,
        name: newName,
      }

      vi.spyOn(service, 'findBudgetByOwnerAndName').mockResolvedValueOnce(null)
      vi.spyOn(service, 'findBudgetById').mockResolvedValueOnce(budget)

      vi.spyOn(service, 'findBudgetByIdAndOwner').mockResolvedValueOnce(budget)

      vi.spyOn(repo, 'save').mockResolvedValueOnce(budget)

      await service.editName(budgetId, owner.id, newName)

      expect(repo.save).toHaveBeenCalledWith(budgetAfterEditName)
    })
  })
})
