import { beforeEach, describe, expect, it } from 'vitest'
import { AuthController } from '../auth.controller'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../auth.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '../../user/user.entity'
import { Repository } from 'typeorm'

describe('AuthController', async () => {
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})