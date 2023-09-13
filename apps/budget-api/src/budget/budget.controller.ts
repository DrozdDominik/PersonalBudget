import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
}
