import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../user/user.entity';
import {
  CreateBudgetDto,
  CreateBudgetResponse,
} from './dtos/create-budget.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { Budget } from './budget.entity';
import {
  ShareBudgetDto,
  ShareBudgetResponseDto,
} from './dtos/share-budget-dto';
import { GetBudgetDto } from './dtos/get-budget.dto';
import { BudgetId, BudgetWithUsers } from './types';

@Controller('budget')
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @UseGuards(AuthGuard('jwt'))
  @Serialize(CreateBudgetResponse)
  @Post('/')
  createBudget(
    @Body() newBudget: CreateBudgetDto,
    @CurrentUser() user: User,
  ): Promise<Budget> {
    return this.budgetService.create(newBudget.name, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetBudgetDto)
  @Get('/:id')
  getBudget(
    @Param('id') id: BudgetId,
    @CurrentUser() user: User,
  ): Promise<BudgetWithUsers> {
    return this.budgetService.get(id, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(ShareBudgetResponseDto)
  @Post('/share')
  shareBudget(
    @Body() data: ShareBudgetDto,
    @CurrentUser() user: User,
  ): Promise<BudgetWithUsers> {
    return this.budgetService.addUser(data.budgetId, user.id, data.newUserId);
  }
}
