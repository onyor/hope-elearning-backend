import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginHistoryEntity } from '@/core/entities/user-login-history.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class TypeormUserLoginHistoryService {
  constructor(
    @InjectRepository(UserLoginHistoryEntity)
    private readonly userLoginHistoryRepository: Repository<UserLoginHistoryEntity>,
  ) {}

  /**
   * Belirli bir kullanıcı ve cihaz kimliği için giriş geçmişini getirir.
   * @param userId Kullanıcı ID'si
   * @param deviceId Cihaz ID'si
   * @returns Kullanıcının giriş geçmişi
   */
  async findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<UserLoginHistoryEntity | undefined> {
    const history = await this.userLoginHistoryRepository.findOne({
      where: { userId, deviceId },
    });
    return history || undefined; // Null kontrolü yaparak undefined döndür
  }

  async findByDeviceId(
    deviceId: string,
  ): Promise<UserLoginHistoryEntity | undefined> {
    const history = await this.userLoginHistoryRepository.findOne({
      where: { deviceId },
    });
    return history || undefined; // Null kontrolü yaparak undefined döndür
  }

  /**
   * Kullanıcı ve cihaz için giriş geçmişi oluşturur veya günceller.
   * @param userId Kullanıcı ID'si
   * @param deviceId Cihaz ID'si
   * @returns Güncellenmiş veya yeni oluşturulmuş giriş geçmişi
   */
  async createOrUpdateHistory(
    userId: string,
    deviceId: string,
  ): Promise<UserLoginHistoryEntity> {
    const existingHistory = await this.userLoginHistoryRepository.findOne({
      where: [{ userId }, { deviceId }],
      order: { startLoginDate: 'DESC' }, // Son kaydı bulmak için sıralama
    });

    if (existingHistory) {
      // Mevcut kaydın endLoginDate'ini güncelle
      existingHistory.lastLoginDate = new Date();
      await this.userLoginHistoryRepository.save(existingHistory);
    }

    // Yeni kayıt oluştur
    const newHistory = this.userLoginHistoryRepository.create({
      userId,
      deviceId,
      startLoginDate: new Date(),
      lastLoginDate: null, // Yeni kayıtta henüz son giriş tarihi yok
    });

    return this.userLoginHistoryRepository.save(newHistory);
  }

  /**
   * Belirli bir cihaz için giriş kaydını sonlandırır.
   * @param userId Kullanıcı ID'si
   * @param deviceId Cihaz ID'si
   * @returns Güncellenmiş giriş geçmişi veya hata
   */
  async updateEndDate(userId: string, deviceId: string): Promise<void> {
    const history = await this.findByUserIdAndDeviceId(userId, deviceId);
    if (history) {
      history.lastLoginDate = new Date();
      await this.userLoginHistoryRepository.save(history);
    }
  }

  /**
   * Tüm giriş geçmişini getirir.
   * @returns Tüm giriş geçmişi
   */
  async findAll(): Promise<UserLoginHistoryEntity[]> {
    return await this.userLoginHistoryRepository.find();
  }

  /**
   * `lastLoginDate` değeri null olan kayıtları getirir.
   */

  async findWithNullLastLoginDate(): Promise<UserLoginHistoryEntity[]> {
    return await this.userLoginHistoryRepository.find({
      where: { lastLoginDate: IsNull() }, // IsNull() operatörü ile null değerleri sorgula
    });
  }
}
