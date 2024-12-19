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
      //yeni cihaza geçmek istedi durumu
      isDeviceApproved?: boolean;
    },
  ) {
    const { uid, deviceId, isDeviceApproved } = body;

    // Cache'den veri al
    const userDeviceList =
      this.cacheManager.getCache<{ userId: string; deviceId: string }[]>(
        'userDeviceList',
      ) || [];

    const existingCacheDeviceUsers = userDeviceList.filter(
      (entry) => entry.deviceId === deviceId,
    );

    const existingCacheDeviceUserPair = existingCacheDeviceUsers.find(
      (entry) => entry.userId === uid,
    );

    if (existingCacheDeviceUserPair) {
      return {
        success: true,
        message: 'Login başarılı.',
        userId: uid,
        deviceId,
      };
    }

    //demek ki bu cihazı başka kullanıcı kullanıyor
    if (existingCacheDeviceUsers.length > 0) {
      return {
        success: false,
        message: 'Bu cihaz başka bir kullanıcıya ait. Bizimle iletişime geçin.',
        requiresApproval: false,
      };
    }

    const existingCacheUserDevices = userDeviceList.filter(
      (entry) => entry.userId === uid,
    );

    if (existingCacheUserDevices.length > 0) {
      if (isDeviceApproved) {
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
      } else
        return {
          success: false,
          message:
            'Yeni bir cihazdan giriş yapıyorsunuz. Hesabınızı bu cihaza aktarmak istiyor musunuz?',
          requiresApproval: true,
        };
    }

    // Veritabanı kontrolü
    const existingDbDeviceUsers =
      await this.userLoginHistoryService.findByDeviceId(deviceId);

    const existingDbDeviceUserPair = existingDbDeviceUsers.find(
      (entry) => entry.userId === uid,
    );

    if (existingCacheDeviceUserPair) {
      this.cacheManager.addToCache(uid, deviceId);

      return {
        success: true,
        message: 'Login başarılı.',
        userId: uid,
        deviceId,
      };
    }

    if (existingDbDeviceUsers.length > 0) {
      return {
        success: false,
        message: 'Bu cihaz başka bir kullanıcıya ait. Bizimle iletişime geçin.',
        requiresApproval: false,
      };
    }

    const existingDbUserDevices =
      await this.userLoginHistoryService.findByUserId(uid);

    if (existingDbUserDevices.length > 0) {
      if (isDeviceApproved) {
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
      } else
        return {
          success: false,
          message:
            'Yeni bir cihazdan giriş yapıyorsunuz. Hesabınızı bu cihaza aktarmak istiyor musunuz?',
          requiresApproval: true,
        };
    }

    return {
      success: true,
      message: 'Yeni cihaz kaydedildi ve giriş başarılı.',
      userId: uid,
      deviceId,
    };
  }
}
