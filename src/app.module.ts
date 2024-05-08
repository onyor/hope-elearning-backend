import { UserModule } from '@/user/user.module';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { BlogModule } from './blog/blog.module';
import { CoreModule } from './core/core.module';
import { CourseModule } from './course/course.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { BookmarkModule } from './bookmark/bookmark.module';

@Module({
  imports: [
    CoreModule,
    UserModule,
    BlogModule,
    CourseModule,
    DashboardModule,
    EnrollmentModule,
    BookmarkModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
