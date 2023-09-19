import { Test, TestingModule } from '@nestjs/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UserController } from '../user.controller'
import { UserService } from '../user.service'
import { User } from '../user.entity'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { faker } from '@faker-js/faker'
import { UserId, UserRole } from '../types'
import { RegisterUserDto } from '../dtos/register-user.dto'
import { AuthGuard } from '@nestjs/passport'
import { EditUserDto } from '../dtos/edit-user.dto'
import { NextFunction, Request, Response } from 'express'
import { EditUserResponseDto } from '../dtos/edit-user-response.dto'
import { RegisterResponseDto } from '../dtos/register-response.dto'

describe('UsersController', () => {
  let controller: UserController
  let service: UserService
  let app: INestApplication

  const user = {
    id: faker.string.uuid() as UserId,
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.User,
    transactions: [],
    categories: [],
    ownBudgets: [],
  } as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(true)
      .compile()

    controller = module.get<UserController>(UserController)

    service = module.get<UserService>(UserService)

    app = module.createNestApplication()

    app.use((req: Request & { user: User }, res: Response, next: NextFunction) => {
      req.user = user
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
    it('should return status code 201 and returns new user id and name ', () => {
      const newUserData: RegisterUserDto = {
        email: user.email,
        name: user.name,
        password: faker.internet.password(),
      }

      const expectedResponse: RegisterResponseDto = {
        id: user.id,
        name: user.name,
      }

      vi.spyOn(service, 'register').mockResolvedValueOnce(user)

      return request(app.getHttpServer())
        .post('/user')
        .send(newUserData)
        .expect(201)
        .expect(expectedResponse)
    })
  })

  describe('GET endpoint', () => {
    it('should return status code 200 and user with provided id', () => {
      vi.spyOn(service, 'get').mockResolvedValueOnce(user)
      return request(app.getHttpServer()).get(`/user/${user.id}`).expect(200).expect(user)
    })
  })

  describe('DELETE endpoint', () => {
    it('should return status code 204', () => {
      vi.spyOn(service, 'delete').mockImplementationOnce(async () => {})
      return request(app.getHttpServer()).delete(`/user/${user.id}`).expect(204)
    })
  })

  describe('PATCH endpoint', () => {
    it('should return status code 200 and returns new user id and name ', () => {
      const dataToEdit: EditUserDto = {
        email: faker.internet.email(),
      }

      const editedUser = {
        ...user,
        ...dataToEdit,
      } as User

      const expectedResponse: EditUserResponseDto = {
        id: editedUser.id,
        name: editedUser.name,
        email: editedUser.email,
      }

      vi.spyOn(service, 'edit').mockResolvedValueOnce(editedUser)
      return request(app.getHttpServer())
        .patch(`/user/${user.id}`)
        .send()
        .expect(200)
        .expect(expectedResponse)
    })
  })
})
