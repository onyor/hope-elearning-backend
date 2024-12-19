// Subject DTO
import { Transform } from 'class-transformer';
import { CategoryDto } from './category.dto';

export class SubjectDto {
  @Transform(({ value }) => Number(value))
  id: number;

  name: string;

  slug: string;

  category?: CategoryDto;

  constructor(partial: Partial<SubjectDto> = {}) {
    Object.assign(this, partial);
  }
}
