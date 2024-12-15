import { Module, forwardRef } from '@nestjs/common';
import { CacheManager } from './cache-manager';
import { UserModule } from '@/user/user.module'; // UserModule burada dahil edilmeli

@Module({
  imports: [
    forwardRef(() => UserModule), // UserModule burada dahil edildi
  ],
  providers: [
    CacheManager, // CacheManager burada tanımlandı
  ],
  exports: [
    CacheManager, // Dışa aktarılıyor
  ],
})
export class CacheModule {}
