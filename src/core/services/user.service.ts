import {
  PageDto,
  Title,
  UserCreateDto,
  UserDto,
  UserQueryDto,
  UserRole,
  UserUpdateDto,
} from '../models';

export interface UserService {
  create(values: UserCreateDto): Promise<UserDto>;

  update(values: UserUpdateDto): Promise<void>;

  updateRole(userId: string, role: UserRole): Promise<void>;

  updateImage(userId: string, image: string): Promise<void>;

  updateEmailVerified(userId: string, emailVerified: boolean): Promise<void>;

  findById(id: string): Promise<UserDto | undefined>;

  findByUsername(username: string): Promise<UserDto | undefined>;

  find(query: UserQueryDto): Promise<PageDto<UserDto>>;

  updateTitle(userId: string, status: Title): Promise<void>;

  getTitle(userId: string): Promise<Title | null>;
}

export const USER_SERVICE = 'UserService';
