import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity.js';
import { Repository } from 'typeorm';
import { CategoryDto } from './category.dto.js';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from './category.response.dto.js';

@Injectable()
export class CategoriesService {

    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(userId: string, dto: CategoryDto): Promise<CategoryResponseDto> {
        if (dto.parentId) {
            const parentCategory = await this.categoryRepository.findOne({
                where: { id: dto.parentId, isDeleted: false }
            });
            if (!parentCategory) {
                throw new Error('Parent category not found');
            }
        }
        const newCategory = this.categoryRepository.create({
            ...dto,
            userId,
            createdBy: userId,
        });
        const savedCategory = await this.categoryRepository.save(newCategory)
        return plainToInstance(CategoryResponseDto, savedCategory, {
            excludeExtraneousValues: true
        });
    }

    async get(user_id: string, id: number) {

    }

    async findAll(userId: string, dto: CategoryDto): Promise<CategoryResponseDto[]> {
        const queryBuilder = this.categoryRepository
            .createQueryBuilder('category')
            .leftJoinAndSelect('category.children', 'children', 'children.is_deleted = FALSE')
            .where('category.is_deleted = FALSE')
            .andWhere('(category.userId = :userId OR category.userId IS NULL)', { userId });

        if (dto.type) {
            queryBuilder.andWhere('category.type = :type', { type: dto.type });
        }

        if (dto.parentId && dto.parentId > 0) {
            queryBuilder.andWhere('category.parentId = :parentId', { parentId: dto.parentId });
        } else {
            queryBuilder.andWhere('category.parentId IS NULL');
        }

        const data = await queryBuilder
            .orderBy('category.name', 'ASC')
            .addOrderBy('children.name', 'ASC')
            .getMany();

        console.log('debug item', JSON.stringify(data[0], null, 2));

        return plainToInstance(CategoryResponseDto, data, {
            excludeExtraneousValues: true
        });
    }

}
