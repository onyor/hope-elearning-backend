import { PageDto } from '../models/page.dto';
import { SubjectCreateDto } from '../models/subject-create.dto';
import { SubjectQueryDto } from '../models/subject-query.dto';
import { SubjectUpdateDto } from '../models/subject-update.dto';
import { SubjectDto } from '../models/subject.dto';

export interface SubjectService {
  create(values: SubjectCreateDto): Promise<number>;

  update(values: SubjectUpdateDto): Promise<void>;

  delete(id: number): Promise<void>;

  findById(id: number): Promise<SubjectDto | undefined>;

  findBySlug(slug: string): Promise<SubjectDto | undefined>;

  find(query: SubjectQueryDto): Promise<PageDto<SubjectDto>>;
}

export const SUBJECT_SERVICE = 'SubjectService';
