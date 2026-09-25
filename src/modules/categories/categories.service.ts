import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity.js';
import { Repository } from 'typeorm';
import { CategoryDto } from './dto/category.dto.js';
import { plainToInstance } from 'class-transformer';
import { CategoryResponseDto } from './dto/category.response.dto.js';

@Injectable()
export class CategoriesService {

    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(userId: string, dto: CategoryDto): Promise<CategoryResponseDto> {
        if (dto.parentId) {
            const parentCategory = await this.categoryRepository.findOne({
                where: { id: dto.parentId }
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

    async findById(userId: string, id: number): Promise<CategoryResponseDto> {
        const queryBuilder = this.categoryRepository
            .createQueryBuilder('category')
            .leftJoinAndSelect(
                'category.children',
                'children',
                '(children.userId = :userId OR children.userId IS NULL)', { userId }
            )
            .andWhere('category.id = :id', { id })
            .andWhere('(category.userId = :userId OR category.userId IS NULL)', { userId });

        const category = await queryBuilder.getOne();
        if (!category) {
            throw new NotFoundException(`Category not found with id ${id}`);
        }
        return plainToInstance(CategoryResponseDto, category, {
            excludeExtraneousValues: true
        });
    }

    async findAll(userId: string, dto: CategoryDto): Promise<CategoryResponseDto[]> {
        const queryBuilder = this.categoryRepository
            .createQueryBuilder('category')
            .leftJoinAndSelect(
                'category.children',
                'children',
                '(children.userId = :userId OR children.userId IS NULL)', { userId }
            )
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

    async update(userId: string, id: number, dto: CategoryDto): Promise<CategoryResponseDto> {
        const category = await this.findById(userId, id);
        if (category.userId === null) {
            throw new UnauthorizedException('You are not authorized to update this category');
        }
        const updateData = Object.fromEntries(
            Object.entries({
                name: dto.name,
                type: dto.type,
                parentId: dto.parentId,
                userId,
                updatedBy: userId
            }).filter(([key, value]) => value !== undefined && value !== null)
        )
        await this.categoryRepository.update(id, updateData);
        return this.findById(userId, id);
    }

    async delete(userId: string, id: number): Promise<void> {
        const category = await this.findById(userId, id);
        if (category.userId === null) {
            throw new UnauthorizedException('You are not authorized to delete this category');
        }
        await this.categoryRepository.softDelete(id);
    }

}
