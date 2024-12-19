import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator';

export class SubjectCreateDto {
  @IsNotEmpty()
  @MaxLength(2000)
  name: string;

  @IsNotEmpty()
  @MaxLength(2000)
  slug: string;

  @IsNumber()
  categoryId: number;
}
