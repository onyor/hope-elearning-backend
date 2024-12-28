// Subject DTO
import { Expose, Transform } from 'class-transformer';
import { CategoryDto } from './category.dto';
import { UserDto } from './user.dto';
import { ChapterDto } from './chapter.dto';
import { AuditingDto } from './auditing.dto';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseAccess {
  FREE = 'free',
  PREMIUM = 'premium',
}

export class SubjectDto {
  @Transform(({ value }) => Number(value))
  id: number;

  title: string;
  slug: string;
  cover?: string;
  excerpt?: string;
  featured: boolean;

  @Expose({ groups: ['detail'] })
  description?: string;

  level: CourseLevel;
  access: CourseAccess;
  status: CourseStatus;
  publishedAt?: string;
  subject?: SubjectDto;
  authors: UserDto[];

  @Expose({ groups: ['detail'] })
  chapters?: ChapterDto[];

  audit?: AuditingDto;

  category?: CategoryDto;

  constructor(partial: Partial<SubjectDto> = {}) {
    Object.assign(this, partial);
  }
}
