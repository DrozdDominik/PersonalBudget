import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CategoryService } from "./category.service";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../guards/AdminGuard";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { Serialize } from "../interceptors/serialize.interceptor";
import { CategoryResponse, DefaultCategoryResponse } from "./dtos/category-response";
import { CurrentUser } from "../decorators/current-user.decorator";
import { User } from "../user/user.entity";

@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Serialize(DefaultCategoryResponse)
    @Post('/default')
    addDefault(@Body() newCategory: CreateCategoryDto) {
        return this.categoryService.createDefault(newCategory)
    }

    @UseGuards(AuthGuard('jwt'))
    @Serialize(CategoryResponse)
    @Post('/')
    add(@Body() newCategory: CreateCategoryDto, @CurrentUser() user: User) {
        return this.categoryService.create(newCategory, user)
    }
}
