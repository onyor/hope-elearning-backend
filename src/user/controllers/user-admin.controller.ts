import { ApiOkResponsePaginated, Roles } from '@/common/decorators';
import { StudentStatus, UserDto, UserQueryDto, UserRole } from '@/core/models';
import { SecurityContextService } from '@/core/security/security-context.service';
import { USER_SERVICE, UserService } from '@/core/services';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseEnumPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('/admin/users')
// @Roles(UserRole.OWNER, UserRole.ADMIN)
export class UserAdminController {
  constructor(
    private security: SecurityContextService,
    @Inject(USER_SERVICE)
    private userService: UserService,
  ) {}

  @ApiOkResponsePaginated(UserDto)
  @Get()
  async find(@Query() query: UserQueryDto) {
    return await this.userService.find(query);
  }

  @Put(':id/role')
  async updateRole(
    @Param('id') userId: string,
    @Body('role', new ParseEnumPipe(UserRole)) role: UserRole,
  ) {
    if (role === UserRole.OWNER) {
      throw new BadRequestException('Owner role grant is forbidden');
    }
    await this.userService.updateRole(userId, role);
  }

  @Get('student-status-list')
  @ApiOperation({
    summary: 'Get all available student statuses and current status',
  })
  async getStudentStatusess() {
    // Kullanıcıyı güvenlik bağlamından al
    const user = this.security.getAuthenticatedUser();
    if (!user) {
      throw new BadRequestException('User not authenticated');
    }

    // Kullanıcının mevcut durumunu al
    const currentStatus = await this.userService.getStudentStatus(user.id);

    // Mevcut durum ve tüm durumların listesi
    return {
      statuses: Object.values(StudentStatus),
      currentStatus,
    };
  }

  @Put('student-status')
  @ApiOperation({ summary: 'Update student status of the authenticated user' })
  async updateStudentStatus(@Body('status') studentStatus: StudentStatus) {
    // Kullanıcıyı güvenlik bağlamından al
    const user = this.security.getAuthenticatedUser();
    if (!user) {
      throw new BadRequestException('User not authenticated');
    }

    // Kullanıcının mevcut durumunu güncelle
    await this.userService.updateStudentStatus(user.id, studentStatus);

    return {
      message: 'Student status updated successfully',
      userId: user.id,
      updatedStatus: studentStatus,
    };
  }
}
