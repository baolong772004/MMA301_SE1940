import { BadRequestException, Injectable } from '@nestjs/common';

import type { CreateReportDto } from './dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bất kỳ user đã đăng nhập đều có thể gửi report (F7).
   * Phải cung cấp storyId hoặc commentId — không thể để cả hai trống.
   */
  async createReport(dto: CreateReportDto, user: AuthUser) {
    if (!dto.storyId && !dto.commentId) {
      throw new BadRequestException('Cần storyId hoặc commentId');
    }
    return this.prisma.report.create({
      data: {
        commentId: dto.commentId,
        reason:    dto.reason,
        reporterId: user.id,
        storyId:   dto.storyId,
      },
    });
  }
}
