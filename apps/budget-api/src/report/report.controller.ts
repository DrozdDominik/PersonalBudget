import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ReportService } from './report.service'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '../decorators/current-user.decorator'
import { User } from '../user/user.entity'
import { BudgetId } from '../budget/types'
import { Serialize } from '../interceptors/serialize.interceptor'
import { ReportResponse } from './dtos/report.dto'
import { CategoryAndDateQueryParamsDto, DateQueryParamsDto } from './dtos/date-query-params.dto'
import { IncomesDto } from './dtos/incomes.dto'

@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @UseGuards(AuthGuard('jwt'))
  @Serialize(ReportResponse)
  @Get('/:id')
  getReport(
    @Param('id') budgetId: BudgetId,
    @Query() dateRange: DateQueryParamsDto,
    @CurrentUser() user: User,
  ) {
    if (dateRange.start && dateRange.end) {
      return this.reportService.getCustomRangeReport(budgetId, user.id, dateRange)
    }

    return this.reportService.getReport(budgetId, user.id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(IncomesDto)
  @Get('/:id/incomes')
  getIncomes(
    @Param('id') budgetId: BudgetId,
    @Query() options: CategoryAndDateQueryParamsDto,
    @CurrentUser() user: User,
  ) {
    return this.reportService.getIncomes(budgetId, user.id, options)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(ReportResponse)
  @Get('/:id/month')
  getMonthReport(@Param('id') budgetId: BudgetId, @CurrentUser() user: User) {
    return this.reportService.getMonthReport(budgetId, user.id)
  }
}
