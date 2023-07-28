import { Body, Controller, Post, UseGuards, Delete, Param, Patch } from '@nestjs/common';
import { CategoryService } from "./category.service";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../guards/AdminGuard";
import { CategoryNameDto } from "./dtos/category-name.dto";
import { Serialize } from "../interceptors/serialize.interceptor";
import { CategoryResponse, DefaultCategoryResponse } from "./dtos/category-response";
import { CurrentUser } from "../decorators/current-user.decorator";
import { User } from "../user/user.entity";
import { CustomCategoryIdentificationData } from "../types";

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
    deleteDefault(@Param('id') id: string) {
        return this.categoryService.deleteDefault(id)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(CategoryResponse)
    @Post('/')
    add(@Body() newCategory: CategoryNameDto, @CurrentUser() user: User) {
        return this.categoryService.create(newCategory, user)
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/:id')
    delete(@Param('id') id: string, @CurrentUser() user: User) {
        return this.categoryService.delete(id, user.id)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(CategoryResponse)
    @Patch('/:id')
    edit(@Param('id') id: string, @Body() newCategory: CategoryNameDto, @CurrentUser() user: User) {
        const categoryIdentificationData: CustomCategoryIdentificationData = {
            categoryId: id,
            userId: user.id
        }

        return this.categoryService.edit(categoryIdentificationData, newCategory.name)
    }
}
