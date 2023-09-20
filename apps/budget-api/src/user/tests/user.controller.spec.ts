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
import { RegisterUserDto } from '../dtos/register-user.dto'
import { AuthGuard } from '@nestjs/passport'
import { EditUserDto } from '../dtos/edit-user.dto'
import { NextFunction, Request, Response } from 'express'
import { EditUserResponseDto } from '../dtos/edit-user-response.dto'
import { RegisterResponseDto } from '../dtos/register-response.dto'
import { userFactory } from './utlis'

describe('UsersController', () => {
  let controller: UserController
  let service: UserService
  let app: INestApplication

  const [loggedUser] = userFactory()

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
    it('should return status code 201 and returns new user id and name ', () => {
      const newUserData: RegisterUserDto = {
        email: loggedUser.email,
        name: loggedUser.name,
        password: faker.internet.password(),
      }

      const expectedResponse: RegisterResponseDto = {
        id: loggedUser.id,
        name: loggedUser.name,
      }

      vi.spyOn(service, 'register').mockResolvedValueOnce(loggedUser)

      return request(app.getHttpServer())
        .post('/user')
        .send(newUserData)
        .expect(201)
        .expect(expectedResponse)
    })
  })

  describe('GET endpoint', () => {
    it('should return status code 200 and user with provided id', () => {
      vi.spyOn(service, 'get').mockResolvedValueOnce(loggedUser)
      return request(app.getHttpServer())
        .get(`/user/${loggedUser.id}`)
        .expect(200)
        .expect(loggedUser)
    })
  })

  describe('DELETE endpoint', () => {
    it('should return status code 204', () => {
      vi.spyOn(service, 'delete').mockImplementationOnce(async () => {})
      return request(app.getHttpServer()).delete(`/user/${loggedUser.id}`).expect(204)
    })
  })

  describe('PATCH endpoint', () => {
    it('should return status code 200 and returns new user id and name ', () => {
      const dataToEdit: EditUserDto = {
        email: faker.internet.email(),
      }

      const editedUser = {
        ...loggedUser,
        ...dataToEdit,
      } as User

      const expectedResponse: EditUserResponseDto = {
        id: editedUser.id,
        name: editedUser.name,
        email: editedUser.email,
      }

      vi.spyOn(service, 'edit').mockResolvedValueOnce(editedUser)
      return request(app.getHttpServer())
        .patch(`/user/${loggedUser.id}`)
        .send()
        .expect(200)
        .expect(expectedResponse)
    })
  })
})
