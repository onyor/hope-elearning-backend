import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SubjectCreateDto } from '@/core/models/subject-create.dto';
import { SubjectUpdateDto } from '@/core/models/subject-update.dto';
import { SubjectQueryDto } from '@/core/models/subject-query.dto';
import { SubjectDto } from '@/core/models/subject.dto';
import {
  SUBJECT_SERVICE,
  SubjectService,
} from '@/core/services/subject.service';
import { ApiOkResponsePaginated } from '@/common/decorators';

@ApiTags('Subject')
@Controller('/content/subjects')
export class SubjectController {
  constructor(
    @Inject(SUBJECT_SERVICE) private subjectService: SubjectService,
  ) {}
  /**
   * Tüm Subject'ları listeleme
   */
  @ApiOkResponsePaginated(SubjectDto)
  @Get()
  async find(@Query() query: SubjectQueryDto) {
    const subjects = await this.subjectService.find({
      ...query,
    });

    console.log('Subjects:', subjects);

    return subjects;
  }

  /**
   * Belirli bir slug'a göre subject getirme
   */
  @Get(':slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Res({ passthrough: true }) resp: Response,
  ): Promise<SubjectDto | undefined> {
    const subject = await this.subjectService.findBySlug(slug);
    if (!subject) {
      resp.status(HttpStatus.NO_CONTENT);
    }
    return subject;
  }

  /**
   * ID ile subject getirme
   */
  @Get('/id/:id')
  async findById(
    @Param('id') id: number,
    @Res({ passthrough: true }) resp: Response,
  ): Promise<SubjectDto | undefined> {
    const subject = await this.subjectService.findById(id);
    if (!subject) {
      resp.status(HttpStatus.NO_CONTENT);
    }
    return subject;
  }

  /**
   * Yeni bir subject oluşturma
   */
  @Post()
  async create(@Body() createDto: SubjectCreateDto): Promise<{ id: number }> {
    const id = await this.subjectService.create(createDto);
    return { id };
  }

  /**
   * Var olan bir subject'i güncelleme
   */
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: SubjectUpdateDto,
  ): Promise<void> {
    const { id: _, ...updateData } = updateDto; // updateDto'dan id'yi çıkartıyoruz
    await this.subjectService.update({ id, ...updateData });
  }

  /**
   * Bir subject'i silme
   */
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.subjectService.delete(id);
  }
}
