import { IsNotEmpty } from 'class-validator';

export class SkillCreateDto {
  @IsNotEmpty()
  name: string;
}
