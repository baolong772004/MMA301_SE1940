import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { CreateReportDto, ResolveReportDto, UpdateUserDto } from './dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';

import {
  Moderation,
  ReportStatus,
  TransactionType,
} from '../common/constants';
import { AUTHOR_SELECT, toStoryResponse } from '../common/utils/story-mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(dto: CreateReportDto, user: AuthUser) {
    if (!dto.storyId && !dto.commentId) {
      throw new BadRequestException('Cần storyId hoặc commentId');
    }
    return this.prisma.report.create({
      data: {
        commentId: dto.commentId,
        reason: dto.reason,
        reporterId: user.id,
        storyId: dto.storyId,
      },
    });
  }

  async listReports(status?: string) {
    return this.prisma.report.findMany({
      include: {
        comment: { select: { content: true, id: true, userId: true } },
        reporter: { select: { handle: true, id: true, name: true } },
        story: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      where: status ? { status } : undefined,
    });
  }

  async listStories(moderation?: string) {
    const stories = await this.prisma.story.findMany({
      include: {
        _count: { select: { chapters: true } },
        author: { select: AUTHOR_SELECT },
      },
      orderBy: { createdAt: 'desc' },
      where: moderation ? { moderation } : undefined,
    });
    return stories.map((story) => ({
      ...toStoryResponse(story),
      chaptersCount: story._count.chapters,
    }));
  }

  async listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        _count: { select: { stories: true } },
        avatarUri: true,
        coinBalance: true,
        createdAt: true,
        email: true,
        emailVerified: true,
        handle: true,
        id: true,
        name: true,
        role: true,
        status: true,
      },
    });
  }

  async moderateStory(id: string, moderation: string) {
    const story = await this.prisma.story.findUnique({ where: { id } });
    if (!story) {
      throw new NotFoundException('Truyện không tồn tại');
    }
    return this.prisma.story.update({
      data: { moderation },
      where: { id },
    });
  }

  async resolveReport(id: string, dto: ResolveReportDto, admin: AuthUser) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Report không tồn tại');
    }
    if (dto.action === 'HIDE_COMMENT' && report.commentId) {
      await this.prisma.comment.update({
        data: { hidden: true },
        where: { id: report.commentId },
      });
    }
    return this.prisma.report.update({
      data: {
        resolvedAt: new Date(),
        resolvedById: admin.id,
        status: dto.status,
      },
      where: { id },
    });
  }

  async stats() {
    const [
      usersCount,
      storiesCount,
      pendingStories,
      chaptersCount,
      commentsCount,
      openReports,
      topupAgg,
      unlockAgg,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.story.count(),
      this.prisma.story.count({ where: { moderation: Moderation.PENDING } }),
      this.prisma.chapter.count(),
      this.prisma.comment.count(),
      this.prisma.report.count({ where: { status: ReportStatus.OPEN } }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: TransactionType.TOPUP },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: TransactionType.UNLOCK },
      }),
    ]);
    return {
      chaptersCount,
      coinsSpentOnUnlocks: Math.abs(unlockAgg._sum.amount ?? 0),
      coinsToppedUp: topupAgg._sum.amount ?? 0,
      commentsCount,
      openReports,
      pendingStories,
      storiesCount,
      usersCount,
    };
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return this.prisma.user.update({
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.role && { role: dto.role }),
      },
      select: {
        email: true,
        handle: true,
        id: true,
        name: true,
        role: true,
        status: true,
      },
      where: { id },
    });
  }
}
