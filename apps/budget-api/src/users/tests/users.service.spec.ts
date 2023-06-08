import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect } from 'vitest'
import { UsersService } from '../users.service';
import { NewUserData, UserRole } from "../types";
import { User } from "../user.entity";
import { faker } from "@faker-js/faker";
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOneByEmail: (email: string) => {
        return Promise.resolve(null);
      },
      create: (newUserData: NewUserData): Promise<User> => {
        const id = faker.string.uuid()
        const newUser = {
          id,
          role: UserRole.User,
          ...newUserData,
          currentToken: null,
        }
        return Promise.resolve(newUser)
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
          UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
