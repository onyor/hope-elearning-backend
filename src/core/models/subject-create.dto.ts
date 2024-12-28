import { IsNotEmpty, IsNumber, MaxLength, IsEnum } from 'class-validator';
import { CourseLevel } from './course.dto';

export class SubjectCreateDto {
  @IsNotEmpty()
  @MaxLength(2000)
  title: string;

  @IsNotEmpty()
  @MaxLength(2000)
  slug: string;

  description?: string;

  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsNumber()
  categoryId: number;
}
