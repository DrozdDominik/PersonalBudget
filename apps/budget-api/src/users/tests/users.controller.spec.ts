import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect } from 'vitest'
import { UsersController } from '../users.controller';
import { UsersService } from "../services/users.service";
import { AuthService } from "../services/auth.service";
import { TypeORMMySqlTestingModule } from "./utils/TypeORMMySqlTestingModule";
import { User } from "../user.entity";

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeORMMySqlTestingModule([User])],
      controllers: [UsersController],
      providers: [
          UsersService,
          AuthService,
          ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
