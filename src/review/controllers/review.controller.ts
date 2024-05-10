import { CourseReviewUpdateDto, QueryDto } from '@/core/models';
import { SecurityContextService } from '@/core/security/security-context.service';
import { COURSE_REVIEW_SERVICE, CourseReviewService } from '@/core/services';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';

@Controller('/content/courses/:courseId/reviews')
export class ReviewController {
  constructor(
    private security: SecurityContextService,
    @Inject(COURSE_REVIEW_SERVICE)
    private courseReviewService: CourseReviewService,
  ) {}

  @Post()
  async writeReview(
    @Param('courseId') courseId: string,
    @Body() values: CourseReviewUpdateDto,
  ) {
    const user = this.security.getAuthenticatedUser();
    await this.courseReviewService.save({
      ...values,
      userId: user.id,
      courseId: courseId,
    });
  }

  @Get()
  async getCourseReviews(
    @Param('courseId') courseId: string,
    @Query() query: QueryDto,
  ) {
    return await this.courseReviewService.findByCourseId(courseId, query);
  }
}
