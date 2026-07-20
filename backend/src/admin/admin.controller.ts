import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import {
  CreateReportDto,
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

@ApiBearerAuth()
@ApiTags('admin')
@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Báo cáo truyện / bình luận vi phạm (mọi user)' })
  @Post('reports')
  createReport(@Body() dto: CreateReportDto, @CurrentUser() user: AuthUser) {
    return this.adminService.createReport(dto, user);
  }

  @ApiOperation({ summary: 'Thống kê toàn app (admin)' })
  @Get('admin/stats')
  @RequireRoles(Roles.ADMIN)
  stats() {
    return this.adminService.stats();
  }

  @ApiOperation({ summary: 'Danh sách user (admin)' })
  @Get('admin/users')
  @RequireRoles(Roles.ADMIN)
  listUsers() {
    return this.adminService.listUsers();
  }

  @ApiOperation({ summary: 'Khóa/mở user, đổi vai trò (admin)' })
  @Patch('admin/users/:id')
  @RequireRoles(Roles.ADMIN)
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @ApiOperation({ summary: 'Danh sách truyện theo trạng thái kiểm duyệt (admin)' })
  @ApiQuery({ name: 'moderation', required: false })
  @Get('admin/stories')
  @RequireRoles(Roles.ADMIN)
  listStories(@Query('moderation') moderation?: string) {
    return this.adminService.listStories(moderation);
  }

  @ApiOperation({ summary: 'Duyệt / từ chối truyện (admin)' })
  @Patch('admin/stories/:id/moderation')
  @RequireRoles(Roles.ADMIN)
  moderateStory(@Param('id') id: string, @Body() dto: ModerateStoryDto) {
    return this.adminService.moderateStory(id, dto.moderation);
  }

  @ApiOperation({ summary: 'Danh sách report (admin)' })
  @ApiQuery({ name: 'status', required: false })
  @Get('admin/reports')
  @RequireRoles(Roles.ADMIN)
  listReports(@Query('status') status?: string) {
    return this.adminService.listReports(status);
  }

  @ApiOperation({ summary: 'Xử lý report (admin)' })
  @Patch('admin/reports/:id')
  @RequireRoles(Roles.ADMIN)
  resolveReport(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.adminService.resolveReport(id, dto, admin);
  }
}
