import { Test, TestingModule } from '@nestjs/testing';
import { IncomeController } from '../income.controller';
import { describe, beforeEach, it, expect } from 'vitest'

describe('IncomeController', () => {
  let controller: IncomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomeController],
    }).compile();

    controller = module.get<IncomeController>(IncomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
