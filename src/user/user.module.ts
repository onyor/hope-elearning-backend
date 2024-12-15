import { BookmarkModule } from '@/bookmark/bookmark.module';
import { EnrollmentModule } from '@/enrollment/enrollment.module';
import { ReviewModule } from '@/review/review.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/core/entities/user.entity';
import { UserLoginHistoryEntity } from '@/core/entities/user-login-history.entity';
import { TypeormUserLoginHistoryService } from './services/typeorm-user.login.history.service';
import { TypeormUserService } from './services/typeorm-user.service';
import { UserAdminController } from './controllers/user-admin.controller';
import { UserProfileController } from './controllers/user-profile.controller';
import { USER_SERVICE, USER_LOGIN_HISTORY_SERVICE } from '@/core/services';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserLoginHistoryEntity]),
    ReviewModule,
    BookmarkModule,
    EnrollmentModule, // Repository tanımları
  ],
  providers: [
    {
      provide: USER_SERVICE, // USER_SERVICE alias'ı
      useClass: TypeormUserService,
    },
    {
      provide: USER_LOGIN_HISTORY_SERVICE, // USER_LOGIN_HISTORY_SERVICE alias'ı
      useClass: TypeormUserLoginHistoryService,
    },
  ],
  controllers: [UserAdminController, UserProfileController],
  exports: [USER_SERVICE, USER_LOGIN_HISTORY_SERVICE], // Alias'lar dışa aktarılıyor
})
export class UserModule {}
