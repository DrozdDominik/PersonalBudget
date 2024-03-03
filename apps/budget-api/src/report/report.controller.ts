import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ReportService } from './report.service'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '../decorators/current-user.decorator'
import { User } from '../user/user.entity'
import { BudgetId, SearchOptions } from '../budget/types'
import { Serialize } from '../interceptors/serialize.interceptor'
import { BudgetReportResponse, ReportResponse } from './dtos/report.dto'
import { CategoryAndDateQueryParamsDto, DateQueryParamsDto } from './dtos/date-query-params.dto'
import { TransactionDto } from './dtos/transactions.dto'
import { TransactionType } from '../transaction/types'
import { DateRange } from '../types'

@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @UseGuards(AuthGuard('jwt'))
  @Serialize(BudgetReportResponse)
  @Get('/')
  getAllReports(
    @Param('id') budgetId: BudgetId,
    @Query() dateRange: DateQueryParamsDto,
    @CurrentUser() user: User,
  ) {
    return this.reportService.getAllReports(user.id, dateRange)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(ReportResponse)
  @Get('/:id')
  getReport(
    @Param('id') budgetId: BudgetId,
    @Query() dateRange: DateQueryParamsDto,
    @CurrentUser() user: User,
  ) {
    return this.reportService.getReport(budgetId, user.id, dateRange)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(TransactionDto)
  @Get('/:id/incomes')
  getIncomes(
    @Param('id') budgetId: BudgetId,
    @Query() options: CategoryAndDateQueryParamsDto,
    @CurrentUser() user: User,
  ) {
    const dateRange: DateRange | undefined =
      options.start && options.end ? { start: options.start, end: options.end } : undefined

    const searchOptions: SearchOptions = {
      type: TransactionType.INCOME,
      category: options.category,
      dateRange,
    }

    return this.reportService.getTransactionsBySearchOptions(budgetId, user.id, searchOptions)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(TransactionDto)
  @Get('/:id/expenses')
  getExpenses(
    @Param('id') budgetId: BudgetId,
    @Query() options: CategoryAndDateQueryParamsDto,
    @CurrentUser() user: User,
  ) {
    const dateRange: DateRange | undefined =
      options.start && options.end ? { start: options.start, end: options.end } : undefined

    const searchOptions: SearchOptions = {
      type: TransactionType.EXPENSE,
      category: options.category,
      dateRange,
    }

    return this.reportService.getTransactionsBySearchOptions(budgetId, user.id, searchOptions)
  }
}
