import NodeCache = require('node-cache');
import { Injectable, Inject, OnApplicationBootstrap } from '@nestjs/common';
import {
  USER_LOGIN_HISTORY_SERVICE,
  UserLoginHistoryService,
} from '@/core/services';

@Injectable()
export class CacheManager implements OnApplicationBootstrap {
  private cache: NodeCache;

  constructor(
    @Inject(USER_LOGIN_HISTORY_SERVICE)
    private readonly loginHistoryService: UserLoginHistoryService, // Service interface
  ) {
    this.cache = new NodeCache();
  }

  async onApplicationBootstrap(): Promise<void> {
    console.log('CacheManager başlatılıyor...');
    await this.initializeCacheFromDB(); // Cache'i doldur
  }

  // Cache'deki veriyi al
  getCache<T>(key: string): T | undefined {
    return this.cache.get(key);
  }

  // Cache'e veri ekle
  setCache<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  // Cache'den veri sil
  deleteFromCache(key: string): void {
    this.cache.del(key);
  }

  // Tüm cache'i temizle
  clearCache(): void {
    this.cache.flushAll();
  }

  // Cache'i kontrol et, yoksa DB'den doldur
  async initializeCacheFromDB(): Promise<void> {
    // Cache'i kontrol et
    const userDeviceList =
      this.getCache<{ userId: string; deviceId: string }[]>('userDeviceList');

    if (!userDeviceList || userDeviceList.length === 0) {
      console.log('Cache boş, veritabanından dolduruluyor...');
      const userLoginHistories =
        await this.loginHistoryService.findWithNullLastLoginDate(); // Yeni metod
      const cacheData = userLoginHistories.map((history) => ({
        userId: history.userId,
        deviceId: history.deviceId,
      }));
      this.setCache('userDeviceList', cacheData); // Cache'e veriyi yükle
    } else {
      console.log('Cache zaten dolu.');
    }
  }

  // Kullanıcı ve cihazı cache'e ekle
  addToCache(userId: string, deviceId: string): void {
    const userDeviceList =
      this.getCache<{ userId: string; deviceId: string }[]>('userDeviceList') ||
      [];
    userDeviceList.push({ userId, deviceId });
    this.setCache('userDeviceList', userDeviceList);
  }

  // Kullanıcı ID'sine göre cache'den cihazı sil
  removeUserFromCache(userId: string): void {
    const userDeviceList =
      this.getCache<{ userId: string; deviceId: string }[]>('userDeviceList') ||
      [];
    const updatedList = userDeviceList.filter(
      (entry) => entry.userId !== userId,
    );
    this.setCache('userDeviceList', updatedList);
  }

  // Cache'in tüm içeriğini listele
  listCache(): void {
    const keys = this.cache.keys(); // Cache'deki tüm anahtarları al
    const cacheData = keys.map((key) => ({
      key,
      value: this.cache.get(key), // Her anahtar için değer al
    }));
    console.log('Cache İçeriği:', cacheData);
  }

  // Cache'i sıfırla (tüm verileri temizle)
  resetCache(): void {
    this.cache.flushAll();
    console.log('Cache sıfırlandı!');
  }
}
