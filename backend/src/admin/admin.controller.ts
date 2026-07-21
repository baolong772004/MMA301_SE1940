import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { AdminService } from './admin.service';
import {
  ListUsersQueryDto,
  ModerateStoryDto,
  ResolveReportDto,
  UpdateUserDto,
} from './dto';
import { Roles } from '../common/constants';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { RequireRoles } from '../common/decorators/roles.decorator';

/**
 * AdminController — chỉ dành cho ADMIN role.
 * Prefix: /admin
 *
 * Lưu ý: createReport (mọi user) nằm ở ReportsController (/reports).
 */
@ApiBearerAuth()
@ApiTags('admin')
@Controller('admin')
@RequireRoles(Roles.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Dashboard Stats ───────────────────────────────────────────────────────

  @ApiOperation({
    summary: 'Thống kê toàn app: users, stories, coins, active users 30d, ...',
  })
  @Get('stats')
  stats() {
    return this.adminService.stats();
  }

  // ── User Management ───────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Danh sách user (phân trang + tìm kiếm)' })
  @Get('users')
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @ApiOperation({ summary: 'Khóa/mở user, đổi vai trò (admin không thể tự đổi chính mình)' })
  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.adminService.updateUser(id, dto, admin);
  }

  // ── Story Moderation ──────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Danh sách truyện theo trạng thái kiểm duyệt' })
  @ApiQuery({ name: 'moderation', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @Get('stories')
  listStories(@Query('moderation') moderation?: string) {
    return this.adminService.listStories(moderation);
  }

  @ApiOperation({ summary: 'Duyệt / từ chối truyện (REJECTED bắt buộc có note)' })
  @Patch('stories/:id/moderation')
  moderateStory(@Param('id') id: string, @Body() dto: ModerateStoryDto) {
    return this.adminService.moderateStory(id, dto.moderation, dto.note);
  }

  // ── Report Management ─────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Danh sách report' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'RESOLVED', 'DISMISSED'] })
  @Get('reports')
  listReports(@Query('status') status?: string) {
    return this.adminService.listReports(status);
  }

  @ApiOperation({
    summary:
      'Xử lý report — action: HIDE_COMMENT | REJECT_STORY | BAN_USER (tuỳ chọn)',
  })
  @Patch('reports/:id')
  resolveReport(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.adminService.resolveReport(id, dto, admin);
  }
}
