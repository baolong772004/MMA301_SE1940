import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateReportDto } from './dto';
import { ReportsService } from './reports.service';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

/**
 * ReportsController — mọi user đã đăng nhập đều có thể gửi report.
 * Prefix: /reports
 *
 * Admin quản lý report (listReports, resolveReport) nằm ở AdminController (/admin/reports).
 */
@ApiBearerAuth()
@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({
    summary:
      'Báo cáo truyện / bình luận vi phạm — cần storyId hoặc commentId',
  })
  @Post()
  createReport(@Body() dto: CreateReportDto, @CurrentUser() user: AuthUser) {
    return this.reportsService.createReport(dto, user);
  }
}
