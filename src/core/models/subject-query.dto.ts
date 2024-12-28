import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from './query.dto';

export class SubjectQueryDto extends QueryDto {
  name?: string;

  includeCourseCount?: boolean;

  published?: boolean;

  constructor(partial: Partial<SubjectQueryDto> = {}) {
    super();
    Object.assign(this, partial);
  }
}
