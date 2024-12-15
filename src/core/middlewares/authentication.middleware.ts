import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { FirebaseService } from '../security/firebase.service';
import { JwtVerificationService } from '../security/jwt-verification.service';
import {
  UserService,
  UserLoginHistoryService,
  USER_SERVICE,
  USER_LOGIN_HISTORY_SERVICE,
} from '../services';
import { AsyncLocalStorage } from 'async_hooks';
import { SecurityContext } from '../security/security-context.domain';
import { CacheManager } from '../cache/cache-manager';
import { UserDto } from '../models';

@Injectable()
export class AuthenticationMiddleware
  implements NestMiddleware<Request, Response>
{
  private readonly webClientTypeValue = '49^LY=sf0TFn';

  constructor(
    private jwtVerificationService: JwtVerificationService,
    private firebaseService: FirebaseService,
    @Inject(USER_SERVICE)
    private userService: UserService,
    @Inject(USER_LOGIN_HISTORY_SERVICE)
    private userLoginHistoryService: UserLoginHistoryService,
    private cacheManager: CacheManager,
    private als: AsyncLocalStorage<SecurityContext>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const clientType = this.extractClientTypeFromCookie(req);

      const token =
        clientType === this.webClientTypeValue
          ? this.extractTokenFromCookie(req)
          : this.extractTokenFromHeader(req);

      if (!token) {
        throw new UnauthorizedException('Access token not found');
      }

      const user = await this.verifyAndRetrieveUser(token);

      if (clientType !== this.webClientTypeValue) {
        await this.validateDeviceId(req, user);
      }

      req['user'] = user;
      const store: SecurityContext = { user: user };
      this.als.run(store, () => next());
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [
      undefined,
      undefined,
    ];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const accessToken = request.cookies['access_token'];
    return accessToken;
  }

  private extractClientTypeFromCookie(request: Request): string | undefined {
    const clientType = request.cookies['client_type'];
    return clientType;
  }

  private async verifyAndRetrieveUser(token: string) {
    const { sub } = await this.jwtVerificationService.verify(token);

    if (!sub) {
      throw new UnauthorizedException('User not found');
    }

    let user = await this.userService.findById(sub);

    if (!user) {
      const authUser = await this.firebaseService.getUser(sub);

      if (!authUser) {
        throw new UnauthorizedException('User not found');
      }

      user = await this.userService.create({
        id: authUser.uid,
        nickname: authUser.displayName ?? 'New User',
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        image: authUser.photoURL,
      });
    }

    return user;
  }

  private async validateDeviceId(req: Request, user: UserDto) {
    const deviceId = req.headers['device-id'] as string;

    if (!deviceId) {
      throw new UnauthorizedException('Device ID not found');
    }

    if (!this.cacheManager.getCache('userDeviceList')) {
      await this.cacheManager.initializeCacheFromDB();
    }

    const userDeviceList =
      this.cacheManager.getCache<{ userId: string; deviceId: string }[]>(
        'userDeviceList',
      ) || [];

    const existingEntry = userDeviceList.find(
      (entry) => entry.userId === user.id && entry.deviceId === deviceId,
    );

    if (!existingEntry) {
      this.cacheManager.addToCache(user.id, deviceId);

      const existingDeviceUser = await this.cacheManager.getCache<{
        userId: string;
        deviceId: string;
      }>('userDeviceList');

      if (existingDeviceUser && existingDeviceUser.userId !== user.id) {
        throw new UnauthorizedException(
          'This device is used by another user. Access denied.',
        );
      }

      await this.userLoginHistoryService.createOrUpdateHistory(
        user.id,
        deviceId,
      );
    }
  }
}
