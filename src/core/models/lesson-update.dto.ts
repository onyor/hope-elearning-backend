import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class LessonUpdateDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  courseId: string;

  @IsOptional()
  @MaxLength(2000)
  title?: string;

  @IsNotEmpty()
  @MaxLength(2000)
  slug: string;

  lexical?: string;

  trial?: boolean;

  @IsDateString()
  updatedAt: string;
}
