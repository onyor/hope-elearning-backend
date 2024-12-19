import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from './query.dto';

export class SubjectQueryDto extends QueryDto {
  @IsOptional()
  @IsString()
  q?: string; // Search query for subject name or slug

  @IsOptional()
  @IsString()
  category?: string; // Filter by category slug or name

  @IsOptional()
  featured?: boolean; // If the subject is featured or not

  orderBy?: 'createdAt' | 'name'; // Ordering options

  constructor(partial: Partial<SubjectQueryDto> = {}) {
    super();
    Object.assign(this, partial);
  }
}
