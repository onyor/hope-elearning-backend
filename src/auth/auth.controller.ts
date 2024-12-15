import { FirebaseService } from '@/core/security/firebase.service';
import { USER_SERVICE, UserService } from '@/core/services';
import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TypeormUserLoginHistoryService } from '../user/services/typeorm-user.login.history.service';
import { USER_LOGIN_HISTORY_SERVICE } from '@/core/services/user.login.history.service';
import NodeCache = require('node-cache');
import { CacheManager } from '../core/cache/cache-manager';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  private cache = new NodeCache();

  constructor(
    // private firebaseService: FirebaseService,
    // @Inject(USER_SERVICE)
    // private userService: UserService,
    @Inject(USER_LOGIN_HISTORY_SERVICE)
    private userLoginHistoryService: TypeormUserLoginHistoryService,
    private cacheManager: CacheManager,
  ) {}

  // this.cache.flushAll();
  @Post('verify-login')
  async verifyLogin(
    @Body()
    body: {
      token: string;
      uid: string;
      deviceId: string;
      isDeviceApproved?: boolean;
    },
  ) {
    const { uid, deviceId, isDeviceApproved } = body;

    // Cache'den veri al
    const userDeviceList =
      this.cacheManager.getCache<{ userId: string; deviceId: string }[]>(
        'userDeviceList',
      ) || [];

    // Cache'de kullanıcı ve cihaz eşleşmesi var mı?
    const existingCacheEntry = userDeviceList.find(
      (entry) => entry.userId === uid && entry.deviceId === deviceId,
    );

    if (existingCacheEntry) {
      return {
        success: true,
        message: 'Login başarılı (Cache).',
        userId: uid,
        deviceId,
      };
    }

    // Veritabanı kontrolü
    const existingDbEntry =
      await this.userLoginHistoryService.findByUserIdAndDeviceId(uid, deviceId);

    if (existingDbEntry) {
      // Cache'e ekle
      this.cacheManager.addToCache(uid, deviceId);

      return {
        success: true,
        message: 'Login başarılı (Database).',
        userId: uid,
        deviceId,
      };
    }

    // Cihaz başka bir kullanıcıya mı ait?
    const existingDeviceUser =
      await this.userLoginHistoryService.findByDeviceId(deviceId);

    if (existingDeviceUser && existingDeviceUser.userId !== uid) {
      if (!isDeviceApproved) {
        return {
          success: false,
          message:
            'Bu cihaz başka bir kullanıcıya ait. Bizimle iletişime geçin.',
          requiresApproval: false,
        };
      }
    }

    // Yeni cihaz durumu
    if (!existingDeviceUser) {
      if (!isDeviceApproved) {
        return {
          success: false,
          message:
            'Yeni bir cihazdan giriş yapıyorsunuz. Hesabınızı bu cihaza aktarmak istiyor musunuz?',
          requiresApproval: true,
        };
      } else {
        // Kullanıcının cache'deki eski cihaz kaydını temizle
        this.cacheManager.removeUserFromCache(uid);

        // Yeni cihaz için giriş kaydını oluştur
        await this.userLoginHistoryService.createOrUpdateHistory(uid, deviceId);

        // Cache'e yeni cihazı ekle
        this.cacheManager.addToCache(uid, deviceId);

        return {
          success: true,
          message: 'Yeni cihaz kaydedildi ve giriş başarılı.',
          userId: uid,
          deviceId,
        };
      }
    }
  }

  @Post('refresh')
  async refresh(@Body('token') token: string) {
    return await this.firebaseService.refreshAccessToken(token);
  }
}
