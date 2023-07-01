import { Test, TestingModule } from '@nestjs/testing';
import { IncomeService } from '../income.service';
import { describe, beforeEach, it, expect } from 'vitest'

describe('IncomeService', () => {
  let service: IncomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncomeService],
    }).compile();

    service = module.get<IncomeService>(IncomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
