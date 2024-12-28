import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DomainError } from '@/common/errors';
import { SubjectEntity } from '@/core/entities/subject-entity';
import { SubjectDto } from '@/core/models/subject.dto';
import { SubjectUpdateDto } from '@/core/models/subject-update.dto';
import { SubjectCreateDto } from '@/core/models/subject-create.dto';
import {
  CourseDto,
  CourseQueryDto,
  CourseStatus,
  PageDto,
  QueryDto,
} from '@/core/models';
import { CourseEntity } from '@/core/entities/course.entity';
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
      title: values.title,
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
      title: values.title,
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

  async findRelated(slug: string, limit: number): Promise<SubjectDto[]> {
    const entities = await this.subjectRepo
      .createQueryBuilder('subject')
      .leftJoinAndSelect('subject.category', 'category')
      .leftJoinAndSelect('subject.meta', 'meta')
      .leftJoinAndSelect('subject.authors', 'subject_author')
      .leftJoinAndSelect('subject_author.author', 'author')
      .where('subject.slug != :slug', { slug })
      .andWhere(
        'subject.subject_id = (SELECT subject_id FROM el_subject WHERE slug = :slug)',
        { slug },
      )
      .andWhere('subject.status = :status', { status: CourseStatus.PUBLISHED })
      .limit(limit)
      .getMany();

    return entities.map((e) => e.toDto());
  }

  async find(query: CourseQueryDto): Promise<PageDto<SubjectDto>> {
    const { limit, offset } = QueryDto.getPageable(query);

    const baseQuery = this.subjectRepo.createQueryBuilder('subject');

    if (query.status) {
      baseQuery.andWhere('subject.status = :status', { status: query.status });
    }

    if (query.access) {
      baseQuery.andWhere('subject.access = :access', {
        access: query.access,
      });
    }

    if (query.level) {
      baseQuery.andWhere('subject.level = :level', {
        level: query.level,
      });
    }

    if (query.featured) {
      baseQuery.andWhere('subject.featured = :featured', {
        featured: query.featured,
      });
    }

    if (query.subject) {
      baseQuery.andWhere('category.slug = :category', {
        subject: query.subject,
      });
    }

    if (query.author) {
      baseQuery.andWhere('subject_author.authorId = :authorId', {
        authorId: query.author,
      });
    }

    if (query.q) {
      baseQuery.andWhere('LOWER(subject.title) LIKE LOWER(:title)', {
        title: `%${query.q}%`,
      });
    }

    let orderBy = 'subject.createdAt';
    if (query.orderBy === 'enrollment') {
      orderBy = 'meta.enrolledCount';
    } else if (query.orderBy === 'publishedAt') {
      orderBy = 'subject.publishedAt';
    }

    baseQuery.orderBy(orderBy, 'DESC');

    const idQuery = baseQuery.clone();
    const dataQuery = baseQuery.clone();

    idQuery
      .leftJoin('subject.subject', 'subject')
      .leftJoin('subject.meta', 'meta')
      .leftJoin('subject.authors', 'subject_author');

    const count = await idQuery.getCount();

    idQuery.select(['subject.id', orderBy]).distinct();

    idQuery.offset(offset).limit(limit);

    const idList = await idQuery.getMany();

    let list: SubjectEntity[] = [];

    if (idList.length > 0) {
      dataQuery
        .andWhereInIds(idList.map((e) => e.id))
        .leftJoinAndSelect('subject.category', 'category')
        .leftJoinAndSelect('subject.authors', 'subject_author')
        .leftJoinAndSelect('subject.author', 'author');

      list = await dataQuery.getMany();
    }

    // const [list, count] = await baseQuery
    //   .offset(offset)
    //   .limit(limit)
    //   .getManyAndCount();

    return PageDto.from({
      list: list.map((e) => e.toDto()),
      count: count,
      offset: offset,
      limit: limit,
    });
  }
}
