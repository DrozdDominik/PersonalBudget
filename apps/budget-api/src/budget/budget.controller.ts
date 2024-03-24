import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { BudgetService } from './budget.service'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '../decorators/current-user.decorator'
import { User } from '../user/user.entity'
import { CreateBudgetDto, CreateBudgetResponseDto } from './dtos/create-budget.dto'
import { Serialize } from '../interceptors/serialize.interceptor'
import { Budget } from './budget.entity'
import { ShareBudgetDto, ShareBudgetResponseDto } from './dtos/share-budget-dto'
import { GetBudgetDto } from './dtos/get-budget.dto'
import { BudgetId, BudgetWithUsers } from './types'
import { EditBudgetNameDto, EditBudgetResponseDto } from './dtos/edit-budget'

@Controller('budget')
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @UseGuards(AuthGuard('jwt'))
  @Serialize(CreateBudgetResponseDto)
  @Post('/')
  createBudget(@Body() newBudget: CreateBudgetDto, @CurrentUser() user: User): Promise<Budget> {
    return this.budgetService.create(newBudget.name, user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(ShareBudgetResponseDto)
  @Patch('/share')
  shareBudget(@Body() data: ShareBudgetDto, @CurrentUser() owner: User): Promise<BudgetWithUsers> {
    return this.budgetService.addUser(data.budgetId, owner.id, data.userId)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(ShareBudgetResponseDto)
  @Patch('/unshare')
  unshareBudget(
    @Body() data: ShareBudgetDto,
    @CurrentUser() owner: User,
  ): Promise<BudgetWithUsers> {
    return this.budgetService.removeUser(data.budgetId, owner.id, data.userId)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(EditBudgetResponseDto)
  @Patch('/:id')
  editBudgetName(
    @Param('id') id: BudgetId,
    @Body() data: EditBudgetNameDto,
    @CurrentUser() user: User,
  ): Promise<Budget> {
    return this.budgetService.editName(id, user.id, data.name)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetBudgetDto)
  @Get('/owner')
  getAllOwnBudgets(@CurrentUser() user: User): Promise<BudgetWithUsers[]> {
    return this.budgetService.getAllOwnBudgets(user.id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetBudgetDto)
  @Get('/shared')
  getAllSharedBudgets(@CurrentUser() user: User): Promise<BudgetWithUsers[]> {
    return this.budgetService.getAllSharedBudgets(user.id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetBudgetDto)
  @Get('/user')
  getAllUserBudgets(@CurrentUser() user: User): Promise<BudgetWithUsers[]> {
    return this.budgetService.getAllUserBudgets(user.id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetBudgetDto)
  @Get('/:id')
  getBudget(@Param('id') id: BudgetId, @CurrentUser() user: User): Promise<BudgetWithUsers> {
    return this.budgetService.getBudget(id, user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBudget(@Param('id') id: BudgetId, @CurrentUser() user: User): Promise<void> {
    return this.budgetService.delete(id, user)
  }
}
