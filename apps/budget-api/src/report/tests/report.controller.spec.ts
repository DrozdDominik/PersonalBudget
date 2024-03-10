import { Test, TestingModule } from '@nestjs/testing'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INestApplication } from '@nestjs/common'
import { userFactory } from '../../user/tests/utlis'
import { UserService } from '../../user/user.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../user/user.entity'
import { AuthGuard } from '@nestjs/passport'
import { NextFunction } from 'express'
import { ReportController } from '../report.controller'
import { ReportService } from '../report.service'
import { BudgetService } from '../../budget/budget.service'
import { Budget } from '../../budget/budget.entity'

describe('BalanceController', () => {
  let controller: ReportController
  let service: ReportService
  let app: INestApplication

  const [loggedUser] = userFactory()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        ReportService,
        UserService,
        BudgetService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Budget),
          useClass: Repository,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(true)
      .compile()

    controller = module.get<ReportController>(ReportController)

    service = module.get<ReportService>(ReportService)

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
})
