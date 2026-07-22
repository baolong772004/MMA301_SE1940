import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

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
    if (!dto.reason.trim()) {
      throw new BadRequestException('Lý do báo cáo không được để trống');
    }
    if (Boolean(dto.storyId) === Boolean(dto.commentId)) {
      throw new BadRequestException(
        'Cần cung cấp đúng một đối tượng báo cáo: storyId hoặc commentId',
      );
    }

    const target = dto.storyId
      ? await this.prisma.story.findUnique({
          select: { id: true },
          where: { id: dto.storyId },
        })
      : await this.prisma.comment.findUnique({
          select: { id: true },
          where: { id: dto.commentId! },
        });
    if (!target) {
      throw new NotFoundException('Nội dung cần báo cáo không tồn tại');
    }

    return this.prisma.report.create({
      data: {
        commentId: dto.commentId,
        reason: dto.reason.trim(),
        reporterId: user.id,
        storyId: dto.storyId,
      },
    });
  }
}
