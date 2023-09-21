import { Test, TestingModule } from '@nestjs/testing'
import { CategoryController } from '../category.controller'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CategoryService } from '../category.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Category } from '../category.entity'
import { Repository } from 'typeorm'
import { Transaction } from '../../transaction/transaction.entity'
import { TransactionService } from '../../transaction/transaction.service'
import { BudgetService } from '../../budget/budget.service'
import { UserService } from '../../user/user.service'
import { Budget } from '../../budget/budget.entity'
import { User } from '../../user/user.entity'
import { INestApplication } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { faker } from '@faker-js/faker'
import { UserRole } from '../../user/types'
import { NextFunction, Request, Response } from 'express'
import { CategoryCreateDto } from '../dtos/category-create.dto'
import { TransactionType } from '../../transaction/types'
import { CustomCategoryResponse, GetCategoriesResponse } from '../dtos/custom-category-response'
import { CategoryId } from '../types'
import request from 'supertest'
import { CategoryEditDto } from '../dtos/category-edit.dto'
import { categoryFactory } from './utils'
import { userFactory } from '../../user/tests/utlis'

describe('CategoryController', () => {
  let controller: CategoryController
  let service: CategoryService
  let app: INestApplication

  const [loggedUser] = userFactory(1, UserRole.Admin)

  const [category] = categoryFactory(TransactionType.INCOME)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        CategoryService,
        TransactionService,
        BudgetService,
        UserService,
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Transaction),
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

    controller = module.get<CategoryController>(CategoryController)

    service = module.get<CategoryService>(CategoryService)

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

  describe('POST "/default" endpoint', () => {
    it('should return status code 201 and DefaultCategoryResponse', () => {
      const newCategoryData: CategoryCreateDto = {
        name: faker.word.noun(),
        transactionType: TransactionType.INCOME,
      }

      const newCategory: Category = {
        id: faker.string.uuid() as CategoryId,
        isDefault: true,
        ...newCategoryData,
        user: null,
        transactions: [],
      }

      const { user, transactions, ...expectedResponse } = newCategory

      vi.spyOn(service, 'createDefault').mockResolvedValueOnce(newCategory)

      return request(app.getHttpServer())
        .post('/category/default')
        .send(newCategoryData)
        .expect(201)
        .expect(expectedResponse)
    })
  })

  describe('POST "/custom" endpoint', () => {
    it('should return status code 201 and CustomCategoryResponse', () => {
      const newCategoryData: CategoryCreateDto = {
        name: faker.word.noun(),
        transactionType: TransactionType.INCOME,
      }

      const newCategory: Category = {
        id: faker.string.uuid() as CategoryId,
        isDefault: false,
        ...newCategoryData,
        user: loggedUser,
        transactions: [],
      }

      const { user, transactions, ...data } = newCategory

      const expectedResponse: CustomCategoryResponse = {
        ...data,
        userId: user.id,
      }

      vi.spyOn(service, 'create').mockResolvedValueOnce(newCategory)

      return request(app.getHttpServer())
        .post('/category/custom')
        .send(newCategoryData)
        .expect(201)
        .expect(expectedResponse)
    })
  })

  describe('DELETE "/default/:id" endpoint', () => {
    it('should return status code 204', () => {
      vi.spyOn(service, 'deleteDefault').mockImplementationOnce(async () => {})
      return request(app.getHttpServer()).delete(`/category/default/${category.id}`).expect(204)
    })
  })

  describe('DELETE "/custom/:id" endpoint', () => {
    it('should return status code 204', () => {
      vi.spyOn(service, 'delete').mockImplementationOnce(async () => {})
      return request(app.getHttpServer()).delete(`/category/custom/${category.id}`).expect(204)
    })
  })

  describe('PATCH "/default/:id" endpoint', () => {
    it('should return status code 200 and DefaultCategoryResponse', () => {
      const dataToEdit: CategoryEditDto = {
        transactionType: TransactionType.EXPENSE,
      }

      const category: Category = {
        id: faker.string.uuid() as CategoryId,
        name: faker.word.noun(),
        transactionType: TransactionType.INCOME,
        isDefault: true,
        user: loggedUser,
        transactions: [],
      }

      const editedCategory: Category = {
        ...category,
        ...dataToEdit,
      }

      const { user, transactions, ...expectedResponse } = editedCategory

      vi.spyOn(service, 'editDefault').mockResolvedValueOnce(editedCategory)

      return request(app.getHttpServer())
        .patch(`/category/default/${category.id}`)
        .send(dataToEdit)
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('PATCH "/custom/:id" endpoint', () => {
    it('should return status code 200 and CategoryResponse', () => {
      const dataToEdit: CategoryEditDto = {
        transactionType: TransactionType.EXPENSE,
      }

      const category: Category = {
        id: faker.string.uuid() as CategoryId,
        name: faker.word.noun(),
        transactionType: TransactionType.INCOME,
        isDefault: false,
        user: loggedUser,
        transactions: [],
      }

      const editedCategory: Category = {
        ...category,
        ...dataToEdit,
      }

      const { user, transactions, ...data } = editedCategory

      const expectedResponse: CustomCategoryResponse = {
        ...data,
        userId: user.id,
      }

      vi.spyOn(service, 'edit').mockResolvedValueOnce(editedCategory)

      return request(app.getHttpServer())
        .patch(`/category/custom/${category.id}`)
        .send(dataToEdit)
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('GET "/default/income" endpoint', () => {
    it('should return status code 200 and GetCategoriesResponse array', () => {
      const defaultIncomeCategories: Category[] = categoryFactory(TransactionType.INCOME, 3)
      const expectedResponse: GetCategoriesResponse[] = defaultIncomeCategories.map(category => ({
        id: category.id,
        name: category.name,
      }))

      vi.spyOn(service, 'getAllDefaultForTransactionType').mockResolvedValueOnce(
        defaultIncomeCategories,
      )

      return request(app.getHttpServer())
        .get('/category/default/income')
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('GET "/custom/income" endpoint', () => {
    it('should return status code 200 and GetCategoriesResponse array', () => {
      const customIncomeCategories: Category[] = categoryFactory(TransactionType.INCOME, 3, false)
      const expectedResponse: GetCategoriesResponse[] = customIncomeCategories.map(category => ({
        id: category.id,
        name: category.name,
      }))

      vi.spyOn(service, 'getAllForTransactionType').mockResolvedValueOnce(customIncomeCategories)

      return request(app.getHttpServer())
        .get('/category/custom/income')
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('GET "/default/expense" endpoint', () => {
    it('should return status code 200 and GetCategoriesResponse array', () => {
      const defaultExpenseCategories: Category[] = categoryFactory(TransactionType.EXPENSE, 3)
      const expectedResponse: GetCategoriesResponse[] = defaultExpenseCategories.map(category => ({
        id: category.id,
        name: category.name,
      }))

      vi.spyOn(service, 'getAllDefaultForTransactionType').mockResolvedValueOnce(
        defaultExpenseCategories,
      )

      return request(app.getHttpServer())
        .get('/category/default/expense')
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('GET "/custom/expense" endpoint', () => {
    it('should return status code 200 and GetCategoriesResponse array', () => {
      const customExpenseCategories: Category[] = categoryFactory(TransactionType.EXPENSE, 3, false)
      const expectedResponse: GetCategoriesResponse[] = customExpenseCategories.map(category => ({
        id: category.id,
        name: category.name,
      }))

      vi.spyOn(service, 'getAllForTransactionType').mockResolvedValueOnce(customExpenseCategories)

      return request(app.getHttpServer())
        .get('/category/custom/expense')
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('GET "/income" endpoint', () => {
    it('should return status code 200 and GetCategoriesResponse array', () => {
      const customIncomeCategories: Category[] = categoryFactory(TransactionType.INCOME, 3, false)
      const defaultIncomeCategories: Category[] = categoryFactory(TransactionType.INCOME, 3)
      const incomeCategories = [...customIncomeCategories, ...defaultIncomeCategories]
      const expectedResponse: GetCategoriesResponse[] = incomeCategories.map(category => ({
        id: category.id,
        name: category.name,
      }))

      vi.spyOn(service, 'getAllAvailableForTransactionType').mockResolvedValueOnce(incomeCategories)

      return request(app.getHttpServer())
        .get('/category/income')
        .expect(200)
        .expect(expectedResponse)
    })
  })

  describe('GET "/expense" endpoint', () => {
    it('should return status code 200 and GetCategoriesResponse array', () => {
      const customExpenseCategories: Category[] = categoryFactory(TransactionType.EXPENSE, 3, false)
      const defaultExpenseCategories: Category[] = categoryFactory(TransactionType.EXPENSE, 3)
      const expenseCategories = [...customExpenseCategories, ...defaultExpenseCategories]
      const expectedResponse: GetCategoriesResponse[] = expenseCategories.map(category => ({
        id: category.id,
        name: category.name,
      }))

      vi.spyOn(service, 'getAllAvailableForTransactionType').mockResolvedValueOnce(
        expenseCategories,
      )

      return request(app.getHttpServer())
        .get('/category/expense')
        .expect(200)
        .expect(expectedResponse)
    })
  })
})
