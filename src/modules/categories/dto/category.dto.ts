import { CategoryType } from "@common/appConstants.js";
import { IsOptional, IsEnum, IsString, IsNotEmpty } from 'class-validator';

export class CategoryDto {
    @IsOptional()
    @IsEnum(CategoryType)
    type: CategoryType;

    @IsOptional()
    @IsString()
    parentId: number | null;

    // @IsOptional()
    // @IsString()
    // userId: string | null;

    @IsNotEmpty()
    @IsString()
    name: string;

}