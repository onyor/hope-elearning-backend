import { SecurityContextService } from '@/core/security/security-context.service';
import { POST_AUTHOR_SERVICE, PostAuthorService } from '@/core/services';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PostOwnerGuard implements CanActivate {
  constructor(
    private security: SecurityContextService,
    @Inject(POST_AUTHOR_SERVICE)
    private postAuthorService: PostAuthorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const user = this.security.getAuthenticatedUser();
    if (user.isAdminOrOwner()) {
      return true;
    }

    const id = request.params['id'] || request.body['id'];

    if (id) {
      return await this.postAuthorService.existByPostAndAuthor(id, user.id);
    }

    return true;
  }
}
