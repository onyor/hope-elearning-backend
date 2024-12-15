import { UserLoginHistoryEntity } from '@/core/entities/user-login-history.entity';

export interface UserLoginHistoryService {
  /**
   * Kullanıcı ve cihaz kimliğine göre giriş geçmişi arar.
   * @param userId Kullanıcı ID'si
   * @param deviceId Cihaz ID'si
   */
  findByUserIdAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<UserLoginHistoryEntity | undefined>;

  /**
   * Cihaz kimliğine göre giriş geçmişi arar.
   * @param deviceId Cihaz ID'si
   */
  findByDeviceId(deviceId: string): Promise<UserLoginHistoryEntity | undefined>;

  /**
   * Kullanıcı ve cihaz kimliği için giriş geçmişi oluşturur veya günceller.
   * @param userId Kullanıcı ID'si
   * @param deviceId Cihaz ID'si
   */
  createOrUpdateHistory(
    userId: string,
    deviceId: string,
  ): Promise<UserLoginHistoryEntity>;

  /**
   * Tüm giriş geçmişlerini getirir.
   * @returns Tüm giriş geçmişleri
   */
  findAll(): Promise<UserLoginHistoryEntity[]>; // Eksik metot buraya eklendi

  /**
   * `lastLoginDate` değeri null olan kayıtları getirir.
   * @returns `lastLoginDate` null olan giriş geçmişleri
   */
  findWithNullLastLoginDate(): Promise<UserLoginHistoryEntity[]>; // Yeni metot burada tanımlandı
}

/**
 * Servis tokeni, dependency injection için kullanılacak.
 */
export const USER_LOGIN_HISTORY_SERVICE = 'UserLoginHistoryService';
