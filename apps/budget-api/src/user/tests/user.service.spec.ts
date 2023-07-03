import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { UserService } from '../user.service';
import { User } from "../user.entity";
import { faker } from "@faker-js/faker";
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserDto } from "../dtos/register-user.dto";
import { BadRequestException } from "@nestjs/common";
import * as utils from "../../utils";
import { UserRole } from "../types";

describe('UsersService', () => {
  let service: UserService;
  let repo: Repository<User>;

  const testUser: User = {
    id: faker.string.uuid(),
    name: faker.internet.userName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    currentToken: null,
    role: UserRole.User,
    incomes: [],
  };

  const registerData: RegisterUserDto = {
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password()
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
            findOne: vi.fn()
          }
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register method', () => {
    const testHashedPassword = 'hashPassword'

  vi.spyOn(utils, 'hashPassword').mockResolvedValue(testHashedPassword)

    it('should call hashPassword function', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)

      await service.register(registerData)
      expect(utils.hashPassword).toHaveBeenCalledWith(registerData.password)
    })

    it('should throw error if provided email is already taken', async () => {
      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(testUser)

      await expect( service.register(registerData) ).rejects.toThrowError(BadRequestException)
    })

    it('should call usersRepository.create method with correct data', async () => {

      const dataWithHashedPassword = {
        name: registerData.name,
        email: registerData.email,
        passwordHash: testHashedPassword,
      }

      vi.spyOn(repo, 'findOne').mockResolvedValueOnce(null)
      vi.spyOn(repo, 'create')

      await service.register(registerData)

      expect(repo.create).toHaveBeenCalledWith(dataWithHashedPassword)
    })
  })
});
