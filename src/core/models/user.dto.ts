import { Expose } from 'class-transformer';
import { AuditingDto } from './auditing.dto';

export enum UserRole {
  USER = 'user',
  CONTRIBUTOR = 'contributor',
  AUTHOR = 'author',
  ADMIN = 'admin',
  OWNER = 'owner',
}

export enum StudentStatus {
  ATPL = 'ATPL',
  TPL = 'TPL',
  ATPL_GRADUATE = 'ATPL_MEZUNU',
  CAPTAIN = 'KAPTAN',
}

export class UserDto {
  id: string;
  nickname: string;
  username: string;
  role: UserRole;
  email: string;
  emailVerified: boolean;
  headline?: string;
  image?: string;

  @Expose({ groups: ['detail'] })
  bio?: string;

  expiredAt: number;

  audit?: AuditingDto;

  status: StudentStatus;

  constructor(partial: Partial<UserDto> = {}) {
    Object.assign(this, partial);
  }

  isAdminOrOwner(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.OWNER;
  }
}
