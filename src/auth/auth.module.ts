import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CacheModule } from '@/core/cache/cache.module';

@Module({
  imports: [UserModule, CacheModule], // CacheModule'u ekledik
  controllers: [AuthController],
})
export class AuthModule {}
