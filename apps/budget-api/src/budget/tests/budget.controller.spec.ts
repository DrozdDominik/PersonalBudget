import { Test, TestingModule } from '@nestjs/testing'
import { BudgetController } from '../budget.controller'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Budget } from '../budget.entity'
import { BudgetService } from '../budget.service'
import { UserService } from '../../user/user.service'
import { User } from '../../user/user.entity'
import { INestApplication } from '@nestjs/common'
import { userFactory } from '../../user/tests/utlis'
import { AuthGuard } from '@nestjs/passport'
import { NextFunction } from 'express'
import { budgetFactory } from './utils'
import { CreateBudgetResponseDto } from '../dtos/create-budget.dto'
import request from 'supertest'
import { ShareBudgetDto, ShareBudgetResponseDto } from '../dtos/share-budget-dto'
import { faker } from '@faker-js/faker'
import { BudgetWithUsers } from '../types'
import { EditBudgetNameDto, EditBudgetResponseDto } from '../dtos/edit-budget'

describe('BudgetController', () => {
  let controller: BudgetController
  let service: BudgetService
  let app: INestApplication

  const [loggedUser] = userFactory()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [
        BudgetService,
        UserService,
        {
          provide: getRepositoryToken(Budget),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(true)
      .compile()

    controller = module.get<BudgetController>(BudgetController)

    service = module.get<BudgetService>(BudgetService)

    app = module.createNestApplication()

    app.use((req: Request & { user: User }, res: Response, next: NextFunction) => {
      req.user = loggedUser
      next()
    })

    await app.init()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('POST endpoint', () => {
    it('should return 201 code and CreateBudgetResponseDto', () => {
      const [newBudget] = budgetFactory()

      const expectedResponse: CreateBudgetResponseDto = {
        id: newBudget.id,
        name: newBudget.name,
        ownerId: newBudget.owner.id,
      }

      vi.spyOn(service, 'create').mockResolvedValueOnce(newBudget)

      return request(app.getHttpServer())
        .post('/budget')
        .send(newBudget.name)
        .expect(201)
        .expect(expectedResponse)
    })
  })

  describe('PATCH "/share" endpoint', () => {
    it('should return 200 code and ShareBudgetResponseDto', () => {
      const [budget] = budgetFactory()

      const [user] = userFactory()

      const data: ShareBudgetDto = {
        userId: user.id,
        budgetId: budget.id,
      }

      const budgetWithNewUser: BudgetWithUsers = {
        ...budget,
        users: [user],
      }

      const expectedResponse: ShareBudgetResponseDto = {
        id: budget.id,
        users: [user.id],
      }

      vi.spyOn(service, 'addUser').mockResolvedValueOnce(budgetWithNewUser)

      return request(app.getHttpServer())
        .patch('/budget/share')
        .send(data)
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('PATCH "/unshare" endpoint', () => {
    it('should return 200 code and ShareBudgetResponseDto', () => {
      const [budget] = budgetFactory()

      const [user] = userFactory()

      const data: ShareBudgetDto = {
        userId: user.id,
        budgetId: budget.id,
      }

      const budgetWithoutUser: BudgetWithUsers = {
        ...budget,
        users: [],
      }

      const expectedResponse: ShareBudgetResponseDto = {
        id: budget.id,
        users: [],
      }

      vi.spyOn(service, 'removeUser').mockResolvedValueOnce(budgetWithoutUser)

      return request(app.getHttpServer())
        .patch('/budget/unshare')
        .send(data)
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('PATCH "/:id" endpoint', () => {
    it('should return 200 code and EditBudgetResponseDto', () => {
      const [budget] = budgetFactory()

      const newName = faker.word.noun()

      const editedBudget = {
        ...budget,
        name: newName,
      }

      const data: EditBudgetNameDto = {
        name: newName,
      }

      const expectedResponse: EditBudgetResponseDto = {
        id: budget.id,
        name: newName,
        ownerId: budget.owner.id,
      }

      vi.spyOn(service, 'editName').mockResolvedValueOnce(editedBudget)

      return request(app.getHttpServer())
        .patch(`/budget/${budget.id}`)
        .send(data)
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('GET "/owner" endpoint', () => {
    it('should return 200 code and GetBudgetDto', () => {
      const [owner] = userFactory()

      const budgets: BudgetWithUsers[] = budgetFactory(5).map(budget => ({
        ...budget,
        owner,
        users: [],
      }))

      const expectedResponse = budgets.map(budget => ({
        id: budget.id,
        name: budget.name,
        owner: budget.owner.id,
        users: budget.users,
        transactions: budget.transactions,
      }))

      vi.spyOn(service, 'getAllOwnBudgets').mockResolvedValueOnce(budgets)

      return request(app.getHttpServer()).get('/budget/owner').expect(200).expect(expectedResponse)
    })
  })

  describe('GET "/shared" endpoint', () => {
    it('should return 200 code and GetBudgetDto', () => {
      const [user] = userFactory()

      const budgets: BudgetWithUsers[] = budgetFactory(5).map(budget => ({
        ...budget,
        users: [user],
      }))

      const expectedResponse = budgets.map(budget => ({
        id: budget.id,
        name: budget.name,
        owner: budget.owner.id,
        users: budget.users.map(user => user.id),
        transactions: budget.transactions,
      }))

      vi.spyOn(service, 'getAllSharedBudgets').mockResolvedValueOnce(budgets)

      return request(app.getHttpServer()).get('/budget/shared').expect(200).expect(expectedResponse)
    })
  })

  describe('GET "/user" endpoint', () => {
    it('should return 200 code and GetBudgetDto', () => {
      const [user] = userFactory()

      const sharedBudgets: BudgetWithUsers[] = budgetFactory(5).map(budget => ({
        ...budget,
        users: [user],
      }))

      const ownBudgets: BudgetWithUsers[] = budgetFactory(5).map(budget => ({
        ...budget,
        user,
        users: [],
      }))

      const budgets: BudgetWithUsers[] = [...sharedBudgets, ...ownBudgets]

      const expectedResponse = budgets.map(budget => ({
        id: budget.id,
        name: budget.name,
        owner: budget.owner.id,
        users: budget.users.map(user => user.id),
        transactions: budget.transactions,
      }))

      vi.spyOn(service, 'getAllUserBudgets').mockResolvedValueOnce(budgets)

      return request(app.getHttpServer()).get('/budget/user').expect(200).expect(expectedResponse)
    })
  })

  describe('GET "/:id" endpoint', () => {
    it('should return 200 code and GetBudgetDto', () => {
      const [budget] = budgetFactory().map(budget => ({
        ...budget,
        users: [],
      }))

      const expectedResponse = {
        id: budget.id,
        name: budget.name,
        owner: budget.owner.id,
        users: budget.users,
        transactions: budget.transactions,
      }

      vi.spyOn(service, 'get').mockResolvedValueOnce(budget)

      return request(app.getHttpServer())
        .get(`/budget/${budget.id}`)
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('DELETE "/:id" endpoint', () => {
    it('should return 204 code', () => {
      const [budget] = budgetFactory()
      vi.spyOn(service, 'delete').mockImplementationOnce(async () => {})
      return request(app.getHttpServer()).delete(`/budget/${budget.id}`).expect(204)
    })
  })
})
