import { ApiHideProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class SubjectUpdateDto {
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @MaxLength(2000)
  name: string;

  @IsNotEmpty()
  @MaxLength(2000)
  slug: string;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;

  @ApiHideProperty()
  updatedBy?: string;
}
