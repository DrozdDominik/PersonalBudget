import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect } from 'vitest'
import { UsersController } from '../users.controller';
import { UsersService } from "../users.service";
import { AuthService } from "../../auth/auth.service";
import { User } from "../user.entity";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
          AuthService,
          UsersService,
          {
              provide: getRepositoryToken(User),
              useClass: Repository,
          },
          ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
