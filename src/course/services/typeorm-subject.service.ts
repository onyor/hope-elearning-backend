import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DomainError } from '@/common/errors';
import { SubjectEntity } from '@/core/entities/subject-entity';
import { SubjectDto } from '@/core/models/subject.dto';
import { SubjectUpdateDto } from '@/core/models/subject-update.dto';
import { SubjectCreateDto } from '@/core/models/subject-create.dto';
import { SubjectQueryDto } from '@/core/models/subject-query.dto';

@Injectable()
export class TypeormSubjectService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(SubjectEntity)
    private subjectRepo: Repository<SubjectEntity>,
  ) {}

  async create(values: SubjectCreateDto): Promise<number> {
    const slugExists = await this.subjectRepo.findOne({
      where: { slug: values.slug },
    });
    if (slugExists) {
      throw new DomainError('Slug already exists');
    }

    const result = await this.subjectRepo.insert({
      name: values.name,
      slug: values.slug,
      category: { id: values.categoryId },
    });

    return result.identifiers[0].id;
  }

  async update(values: SubjectUpdateDto): Promise<void> {
    const entity = await this.subjectRepo.findOne({ where: { id: values.id } });

    if (!entity) {
      throw new DomainError('Subject not found');
    }

    await this.subjectRepo.update(values.id, {
      name: values.name,
      slug: values.slug,
      category: { id: values.categoryId },
    });
  }

  async delete(id: number): Promise<void> {
    const entity = await this.subjectRepo.findOne({ where: { id } });

    if (!entity) {
      throw new DomainError('Subject not found');
    }

    await this.subjectRepo.delete(id);
  }

  async findById(id: number): Promise<SubjectDto | undefined> {
    const entity = await this.subjectRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    return entity?.toDto();
  }

  async findAll(): Promise<SubjectDto[]> {
    const entities = await this.subjectRepo.find({ relations: ['category'] });
    return entities.map((e) => e.toDto());
  }

  async findBySlug(slug: string): Promise<SubjectDto | undefined> {
    const entity = await this.subjectRepo.findOne({
      where: { slug },
      relations: ['category'],
    });

    return entity?.toDto();
  }

  async find(query: SubjectQueryDto): Promise<SubjectDto[]> {
    const qb = this.subjectRepo
      .createQueryBuilder('subject')
      .leftJoinAndSelect('subject.category', 'category');

    if (query.q) {
      qb.andWhere(
        'LOWER(subject.name) LIKE LOWER(:q) OR LOWER(subject.slug) LIKE LOWER(:q)',
        {
          q: `%${query.q}%`,
        },
      );
    }

    if (query.category) {
      qb.andWhere(
        'LOWER(category.slug) = LOWER(:category) OR LOWER(category.name) = LOWER(:category)',
        {
          category: query.category,
        },
      );
    }

    if (query.featured !== undefined) {
      qb.andWhere('subject.featured = :featured', { featured: query.featured });
    }

    if (query.orderBy) {
      qb.orderBy(`subject.${query.orderBy}`, 'ASC');
    } else {
      qb.orderBy('subject.createdAt', 'DESC');
    }

    return (await qb.getMany()).map((subject) => subject.toDto());
  }
}
