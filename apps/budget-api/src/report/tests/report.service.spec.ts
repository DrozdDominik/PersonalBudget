import { Test, TestingModule } from '@nestjs/testing'

import { beforeEach, describe, expect, it } from 'vitest'
import { ReportService } from '../report.service'

describe('BalanceService', () => {
  let service: ReportService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportService],
    }).compile()

    service = module.get<ReportService>(ReportService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
