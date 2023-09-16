import { Test, TestingModule } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserService } from '../user.service'
import { User } from '../user.entity'
import { faker } from '@faker-js/faker'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { RegisterUserDto } from '../dtos/register-user.dto'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import * as utils from '../../utils'
import { UserId, UserIdentificationData, UserRole } from '../types'
import { EditUserDto } from '../dtos/edit-user.dto'

describe('UsersService', () => {
  let service: UserService
  let repo: Repository<User>

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

  const registerData: RegisterUserDto = {
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)

    repo = module.get<Repository<User>>(getRepositoryToken(User))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('Register method', () => {
    const testHashedPassword = 'hashPassword'

    vi.spyOn(utils, 'hashPassword').mockResolvedValue(testHashedPassword)

    it('should call hashPassword function', async () => {
      vi.spyOn(service, 'findOneByEmail').mockResolvedValueOnce(null)

      await service.register(registerData)
      expect(utils.hashPassword).toHaveBeenCalledWith(registerData.password)
    })

    it('should throw error if provided email is already taken', async () => {
      vi.spyOn(service, 'findOneByEmail').mockResolvedValueOnce(user)

      await expect(service.register(registerData)).rejects.toThrowError(BadRequestException)
    })

    it('should call usersRepository.create method with correct data', async () => {
      const dataWithHashedPassword = {
        name: registerData.name,
        email: registerData.email,
        passwordHash: testHashedPassword,
      }

      vi.spyOn(service, 'findOneByEmail').mockResolvedValueOnce(null)
      vi.spyOn(repo, 'create')

      await service.register(registerData)

      expect(repo.create).toHaveBeenCalledWith(dataWithHashedPassword)
    })
  })

  describe('Edit method', () => {
    it('should throw error if there is no user with provided id', async () => {
      const loggedUserData: UserIdentificationData = {
        id: user.id,
        role: UserRole.User,
      }

      const editedData: EditUserDto = {
        name: faker.word.noun(),
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(null)

      await expect(service.edit(user.id, loggedUserData, editedData)).rejects.toThrowError(
        NotFoundException,
      )
    })

    it('should throw error if provided user id and current not admin logged user id are different', async () => {
      const loggedUserData: UserIdentificationData = {
        id: faker.string.uuid() as UserId,
        role: UserRole.User,
      }

      const editedData: EditUserDto = {
        name: faker.word.noun(),
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)

      await expect(service.edit(user.id, loggedUserData, editedData)).rejects.toThrowError(
        ForbiddenException,
      )
    })

    it('should throw error if provided edited email is already taken', async () => {
      const loggedUserData: UserIdentificationData = {
        id: user.id,
        role: UserRole.User,
      }

      const editedData: EditUserDto = {
        email: faker.internet.email(),
      }

      const anotherUser = {
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

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)
      vi.spyOn(service, 'findOneByEmail').mockResolvedValueOnce(anotherUser)

      await expect(service.edit(user.id, loggedUserData, editedData)).rejects.toThrowError(
        BadRequestException,
      )
    })

    it('should call hashPassword function with provided password', async () => {
      const loggedUserData: UserIdentificationData = {
        id: user.id,
        role: UserRole.User,
      }

      const editedData: EditUserDto = {
        password: faker.internet.password(),
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)
      vi.spyOn(utils, 'hashPassword')

      await service.edit(user.id, loggedUserData, editedData)

      expect(utils.hashPassword).toHaveBeenCalledWith(editedData.password)
    })

    it('should call usersRepository.save method with edited data', async () => {
      const loggedUserData: UserIdentificationData = {
        id: user.id,
        role: UserRole.User,
      }

      const editedData: EditUserDto = {
        name: faker.word.noun(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      }

      const passwordHash = faker.string.hexadecimal()

      const editedDataToSave = {
        name: editedData.name,
        email: editedData.email,
        passwordHash,
      }

      const editedUser: User = {
        ...user,
        ...editedDataToSave,
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)
      vi.spyOn(service, 'findOneByEmail').mockResolvedValueOnce(null)
      vi.spyOn(utils, 'hashPassword').mockResolvedValue(passwordHash)

      await service.edit(user.id, loggedUserData, editedData)

      expect(repo.save).toHaveBeenCalledWith(editedUser)
    })

    it('should edit another user data by admin', async () => {
      const loggedUserData: UserIdentificationData = {
        id: faker.string.uuid() as UserId,
        role: UserRole.Admin,
      }

      const editedData: EditUserDto = {
        name: faker.word.noun(),
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)

      const editedUser: User = {
        ...user,
        name: editedData.name,
      }

      await service.edit(user.id, loggedUserData, editedData)

      expect(repo.save).toHaveBeenCalledWith(editedUser)
    })
  })

  describe('Delete method', () => {
    it('should throw error if there is no user with provided id', async () => {
      const loggedUserData: UserIdentificationData = {
        id: user.id,
        role: UserRole.User,
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(null)

      await expect(service.delete(user.id, loggedUserData)).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if provided user id and current not admin logged user id are different', async () => {
      const loggedUserData: UserIdentificationData = {
        id: faker.string.uuid() as UserId,
        role: UserRole.User,
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)

      await expect(service.delete(user.id, loggedUserData)).rejects.toThrowError(ForbiddenException)
    })

    it('should call usersRepository.delete method with correct id', async () => {
      const loggedUserData: UserIdentificationData = {
        id: user.id,
        role: UserRole.User,
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({ raw: [], affected: 1 })

      await service.delete(user.id, loggedUserData)

      expect(repo.delete).toHaveBeenCalledWith(user.id)
    })

    it('should delete another user by admin', async () => {
      const loggedUserData: UserIdentificationData = {
        id: faker.string.uuid() as UserId,
        role: UserRole.Admin,
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)
      vi.spyOn(repo, 'delete').mockResolvedValueOnce({ raw: [], affected: 1 })

      await service.delete(user.id, loggedUserData)

      expect(repo.delete).toHaveBeenCalledWith(user.id)
    })
  })

  describe('Get method', () => {
    it('should throw error if there is no user with provided id', async () => {
      const loggedUserData: UserIdentificationData = {
        id: user.id,
        role: UserRole.User,
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(null)

      await expect(service.get(user.id, loggedUserData)).rejects.toThrowError(NotFoundException)
    })

    it('should throw error if provided user id and current not admin logged user id are different', async () => {
      const loggedUserData: UserIdentificationData = {
        id: faker.string.uuid() as UserId,
        role: UserRole.User,
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)

      await expect(service.get(user.id, loggedUserData)).rejects.toThrowError(ForbiddenException)
    })

    it('should return user', async () => {
      const loggedUserData: UserIdentificationData = {
        id: user.id,
        role: UserRole.User,
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)

      const result = await service.get(user.id, loggedUserData)

      expect(result).toEqual(user)
    })

    it('should return another user if user is admin', async () => {
      const loggedUserData: UserIdentificationData = {
        id: faker.string.uuid() as UserId,
        role: UserRole.Admin,
      }

      vi.spyOn(service, 'findOneById').mockResolvedValueOnce(user)

      const result = await service.get(user.id, loggedUserData)

      expect(result).toEqual(user)
    })
  })
})