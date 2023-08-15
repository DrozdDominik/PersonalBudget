import { Body, Controller, Post, UseGuards, Delete, Param, Patch, Get } from '@nestjs/common';
import { CategoryService } from "./category.service";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../guards/AdminGuard";
import { CategoryNameDto } from "./dtos/category-name.dto";
import { Serialize } from "../interceptors/serialize.interceptor";
import { CategoryResponse, DefaultCategoryResponse, GetCategoriesResponse } from "./dtos/category-response";
import { CurrentUser } from "../decorators/current-user.decorator";
import { User } from "../user/user.entity";
import { CustomCategoryIdentificationData } from "../types";
import { CategoryId } from "./types";

@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Serialize(DefaultCategoryResponse)
    @Post('/default')
    addDefault(@Body() newCategory: CategoryNameDto) {
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
    editDefault(@Param('id') id: CategoryId, @Body() newCategory: CategoryNameDto) {
        return this.categoryService.editDefault(id, newCategory.name)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(GetCategoriesResponse)
    @Get('/default')
    getAllDefault() {
        return this.categoryService.getAllDefault()
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(CategoryResponse)
    @Post('/')
    add(@Body() newCategory: CategoryNameDto, @CurrentUser() user: User) {
        return this.categoryService.create(newCategory, user)
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/:id')
    delete(@Param('id') id: CategoryId, @CurrentUser() user: User) {
        return this.categoryService.delete(id, user.id)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(CategoryResponse)
    @Patch('/:id')
    edit(@Param('id') id: CategoryId, @Body() newCategory: CategoryNameDto, @CurrentUser() user: User) {
        const categoryIdentificationData: CustomCategoryIdentificationData = {
            categoryId: id,
            userId: user.id
        }

        return this.categoryService.edit(categoryIdentificationData, newCategory.name)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(GetCategoriesResponse)
    @Get('/')
    getAll(@CurrentUser() user: User) {
        return this.categoryService.getAll(user.id)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(GetCategoriesResponse)
    @Get('/all')
    getAllForUser(@CurrentUser() user: User) {
        return this.categoryService.getAllAvailable(user.id)
    }
}
