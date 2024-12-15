import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './database/database.module';
import { DomainExceptionFilter } from './filters';
import { SecurityModule } from './security/security.module';
import { StorageModule } from './storage/storage.module';
import { CacheModule } from './cache/cache.module'; // CacheModule'u içe aktarın

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    SecurityModule,
    StorageModule,
    CacheModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class CoreModule {}
