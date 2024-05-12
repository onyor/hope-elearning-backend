import { Staff } from '@/common/decorators';
import { PostCreateDto, PostQueryDto, PostUpdateDto } from '@/core/models';
import { SecurityContextService } from '@/core/security/security-context.service';
import { POST_SERVICE, PostService } from '@/core/services';
import {
  FILE_STORAGE_SERVICE,
  FileStorageService,
} from '@/core/storage/file-storage.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Res,
  SerializeOptions,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PostOwnerGuard } from '../guards/post-owner.guard';
import { PostCreateTransformPipe } from '../pipes/post-create-transform.pipe';
import { PostQueryTransformPipe } from '../pipes/post-query-transform.pipe';
import { PostUpdateTransformPipe } from '../pipes/post-update-transform.pipe';

@Controller('/admin/posts')
@Staff()
export class PostAdminController {
  constructor(
    private security: SecurityContextService,
    @Inject(POST_SERVICE)
    private postService: PostService,
    @Inject(FILE_STORAGE_SERVICE)
    private fileStorageService: FileStorageService,
  ) {}

  @Post()
  async create(@Body(PostCreateTransformPipe) values: PostCreateDto) {
    return await this.postService.create(values);
  }

  @SerializeOptions({
    groups: ['detail'],
  })
  @UseGuards(PostOwnerGuard)
  @Put()
  async update(@Body(PostUpdateTransformPipe) values: PostUpdateDto) {
    await this.postService.update(values);
  }

  @Get()
  async find(@Query(PostQueryTransformPipe) query: PostQueryDto) {
    return await this.postService.find(query);
  }

  @UseGuards(PostOwnerGuard)
  @Put(':id/publish')
  async publishPost(@Param('id') id: string) {
    const user = this.security.getAuthenticatedUser();
    await this.postService.publish(user.id, id);
  }

  @UseGuards(PostOwnerGuard)
  @Put(':id/unpublish')
  async unpublishPost(@Param('id') id: string) {
    await this.postService.unpublish(id);
  }

  @UseGuards(PostOwnerGuard)
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.fileStorageService.writeFile(file);

    if (!result) {
      throw new BadRequestException('Required upload file');
    }

    return result.url;
  }

  @SerializeOptions({
    groups: ['detail'],
  })
  @UseGuards(PostOwnerGuard)
  @Get(':id')
  async getPost(
    @Param('id') id: string,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const result = await this.postService.findById(id);
    if (!result) {
      resp.status(HttpStatus.NO_CONTENT);
    }
    return result;
  }

  @UseGuards(PostOwnerGuard)
  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    await this.postService.delete(id);
  }
}
