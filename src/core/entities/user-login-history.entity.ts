import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_login_history' })
@Index('IDX_USER_LOGIN_HISTORY', ['userId', 'deviceId'])
export class UserLoginHistoryEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', length: 50 })
  userId: string;

  @Column({ name: 'device_id', length: 100 })
  deviceId: string;

  @Column({ name: 'start_login_date', type: 'timestamptz', nullable: true })
  startLoginDate: Date;

  @Column({ name: 'last_login_date', type: 'timestamptz', nullable: true })
  lastLoginDate: Date | null;
}
