import { Test, TestingModule } from '@nestjs/testing'
import { TransactionController } from '../transaction.controller'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TransactionService } from '../transaction.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Transaction } from '../transaction.entity'
import { Repository } from 'typeorm'
import { CategoryService } from '../../category/category.service'
import { Category } from '../../category/category.entity'
import { BudgetService } from '../../budget/budget.service'
import { UserService } from '../../user/user.service'
import { Budget } from '../../budget/budget.entity'
import { User } from '../../user/user.entity'
import { INestApplication } from '@nestjs/common'
import { userFactory } from '../../user/tests/utlis'
import { AuthGuard } from '@nestjs/passport'
import { NextFunction, Request, Response } from 'express'
import { CreateTransactionDto } from '../dtos/create-transaction.dto'
import { TransactionType } from '../types'
import { transactionFactory } from './utils'
import request from 'supertest'
import { TransactionResponse } from '../dtos/transaction-response'
import { EditTransactionDto } from '../dtos/edit-transaction.dto'
import { faker } from '@faker-js/faker'

describe('TransactionController', () => {
  let controller: TransactionController
  let service: TransactionService
  let app: INestApplication

  const [loggedUser] = userFactory()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        CategoryService,
        BudgetService,
        UserService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
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

    controller = module.get<TransactionController>(TransactionController)

    service = module.get<TransactionService>(TransactionService)

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
    it('should return 201 code and TransactionResponse', () => {
      const [newTransaction] = transactionFactory(1, TransactionType.INCOME)
      const newTransactionData: CreateTransactionDto = {
        categoryId: newTransaction.category.id,
        type: newTransaction.type,
        amount: newTransaction.amount,
        date: newTransaction.date,
        budgetId: newTransaction.budget.id,
        comment: newTransaction.comment,
      }
      const expectedResponse: TransactionResponse = {
        id: newTransaction.id,
        type: newTransaction.type,
        category: newTransaction.category.name,
        amount: newTransaction.amount,
        date: newTransaction.date.toISOString(),
        budgetId: newTransaction.budget.id,
        comment: newTransaction.comment,
        userId: newTransaction.user.id,
      }

      vi.spyOn(service, 'create').mockResolvedValueOnce(newTransaction)

      return request(app.getHttpServer())
        .post('/transaction')
        .send(newTransactionData)
        .expect(201)
        .expect(expectedResponse)
    })
  })

  describe('PATCH endpoint', () => {
    it('should return 200 code and TransactionResponse', () => {
      const editedData: EditTransactionDto = {
        type: TransactionType.EXPENSE,
        amount: faker.number.float({ min: 0, max: 1000000, fractionDigits: 2 }),
      }

      const [transaction] = transactionFactory(1, TransactionType.INCOME)

      const editedTransaction: Transaction = {
        ...transaction,
        ...editedData,
      }

      const expectedResponse: TransactionResponse = {
        id: editedTransaction.id,
        type: editedTransaction.type,
        category: editedTransaction.category.name,
        amount: editedTransaction.amount,
        date: editedTransaction.date.toISOString(),
        budgetId: editedTransaction.budget.id,
        comment: editedTransaction.comment,
        userId: editedTransaction.user.id,
      }

      vi.spyOn(service, 'edit').mockResolvedValueOnce(editedTransaction)

      return request(app.getHttpServer())
        .patch(`/transaction/${transaction.id}`)
        .send(editedData)
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('DELETE endpoint', () => {
    it('should return 204 code', () => {
      const [transaction] = transactionFactory(1, TransactionType.INCOME)
      vi.spyOn(service, 'delete').mockImplementationOnce(async () => {})
      return request(app.getHttpServer()).delete(`/transaction/${transaction.id}`).expect(204)
    })
  })

  describe('GET "/" endpoint', () => {
    it('should return 200 code and TransactionResponse', () => {
      const transactions = transactionFactory(5, TransactionType.INCOME)
      const expectedResponse: TransactionResponse[] = transactions.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        category: transaction.category.name,
        amount: transaction.amount,
        date: transaction.date.toISOString(),
        budgetId: transaction.budget.id,
        comment: transaction.comment,
        userId: transaction.user.id,
      }))
      vi.spyOn(service, 'getAll').mockResolvedValueOnce(transactions)

      return request(app.getHttpServer()).get('/transaction').expect(200).expect(expectedResponse)
    })
  })

  describe('GET "/:id" endpoint', () => {
    it('should return 200 code and TransactionResponse', () => {
      const [transaction] = transactionFactory(1, TransactionType.INCOME)
      const expectedResponse: TransactionResponse = {
        id: transaction.id,
        type: transaction.type,
        category: transaction.category.name,
        amount: transaction.amount,
        date: transaction.date.toISOString(),
        budgetId: transaction.budget.id,
        comment: transaction.comment,
        userId: transaction.user.id,
      }
      vi.spyOn(service, 'getOne').mockResolvedValueOnce(transaction)

      return request(app.getHttpServer())
        .get(`/transaction/${transaction.id}`)
        .expect(200)
        .expect(expectedResponse)
    })
  })
})
