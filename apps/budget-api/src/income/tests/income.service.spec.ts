import { Test, TestingModule } from '@nestjs/testing';
import { IncomeService } from '../income.service';
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { Repository } from "typeorm";
import { Income } from "../income.entity";
import { getRepositoryToken } from "@nestjs/typeorm";

describe('IncomeService', () => {
  let service: IncomeService;
  let repo: Repository<Income>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
          IncomeService,
        {
          provide: getRepositoryToken(Income),
          useValue: {
            create: vi.fn(),
            save: vi.fn(),
            findOne: vi.fn()
          }
        },
      ],
    }).compile();

    service = module.get<IncomeService>(IncomeService);

    repo = module.get<Repository<Income>>(getRepositoryToken(Income));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
