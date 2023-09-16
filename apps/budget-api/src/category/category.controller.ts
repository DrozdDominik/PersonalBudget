import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { CategoryService } from './category.service'
import { AuthGuard } from '@nestjs/passport'
import { AdminGuard } from '../guards/AdminGuard'
import { CategoryCreateDto } from './dtos/category-create.dto'
import { Serialize } from '../interceptors/serialize.interceptor'
import {
  CategoryResponse,
  DefaultCategoryResponse,
  GetCategoriesResponse,
} from './dtos/category-response'
import { CurrentUser } from '../decorators/current-user.decorator'
import { User } from '../user/user.entity'
import { CustomCategoryIdentificationData } from '../types'
import { CategoryId } from './types'
import { TransactionType } from '../transaction/types'
import { CategoryEditDto } from './dtos/category-edit.dto'

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Serialize(DefaultCategoryResponse)
  @Post('/default')
  addDefault(@Body() newCategory: CategoryCreateDto) {
    return this.categoryService.createDefault(newCategory)
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete('/default/:id')
  deleteDefault(@Param('id') id: CategoryId) {
    return this.categoryService.deleteDefault(id)
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Serialize(DefaultCategoryResponse)
  @Patch('/default/:id')
  editDefault(@Param('id') id: CategoryId, @Body() dataToEdit: CategoryEditDto) {
    return this.categoryService.editDefault(id, dataToEdit)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetCategoriesResponse)
  @Get('/default/income')
  getAllDefaultForIncome() {
    return this.categoryService.getAllDefaultForTransactionType(TransactionType.INCOME)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetCategoriesResponse)
  @Get('/default/expense')
  getAllDefaultForExpense() {
    return this.categoryService.getAllDefaultForTransactionType(TransactionType.EXPENSE)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(CategoryResponse)
  @Post('/custom')
  add(@Body() newCategory: CategoryCreateDto, @CurrentUser() user: User) {
    return this.categoryService.create(newCategory, user)
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/custom/:id')
  delete(@Param('id') id: CategoryId, @CurrentUser() user: User) {
    return this.categoryService.delete(id, user.id)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(CategoryResponse)
  @Patch('/custom/:id')
  edit(
    @Param('id') id: CategoryId,
    @Body() dataToEdit: CategoryEditDto,
    @CurrentUser() user: User,
  ) {
    const categoryIdentificationData: CustomCategoryIdentificationData = {
      categoryId: id,
      userId: user.id,
    }

    return this.categoryService.edit(categoryIdentificationData, dataToEdit)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetCategoriesResponse)
  @Get('/custom/income')
  getAllForIncome(@CurrentUser() user: User) {
    return this.categoryService.getAllForTransactionType(user.id, TransactionType.INCOME)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetCategoriesResponse)
  @Get('/custom/expense')
  getAllForExpense(@CurrentUser() user: User) {
    return this.categoryService.getAllForTransactionType(user.id, TransactionType.EXPENSE)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetCategoriesResponse)
  @Get('/income')
  getAllForUserAndForIncome(@CurrentUser() user: User) {
    return this.categoryService.getAllAvailableForTransactionType(user.id, TransactionType.INCOME)
  }

  @UseGuards(AuthGuard('jwt'))
  @Serialize(GetCategoriesResponse)
  @Get('/expense')
  getAllForUserAndForExpense(@CurrentUser() user: User) {
    return this.categoryService.getAllAvailableForTransactionType(user.id, TransactionType.EXPENSE)
  }
}
