import { Body, Controller, Get, Post, Query, Request, UseGuards } from "@nestjs/common";
import { CategoriesService } from "./categories.service.js";
import { CategoryDto } from "./category.dto.js";
import { AuthGuard } from "@modules/auth/guards/auth/auth.guard.js";
import { CurrentUser } from "@common/decorators/current-user.decorator.js";
import { type UserPojo } from "@common/interfaces/user.interface.js";
import { CategoryResponseDto } from "./category.response.dto.js";

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async findAll(
        @CurrentUser() user: UserPojo,
        @Query() query: CategoryDto,
    ): Promise<CategoryResponseDto[]> {
        return this.categoriesService.findAll(user.userId, query);
    }

    @Post()
    async create(
        @CurrentUser() user: UserPojo,
        @Body() dto: CategoryDto,
    ): Promise<CategoryResponseDto> {
        return this.categoriesService.create(user.userId, dto);
    }
}