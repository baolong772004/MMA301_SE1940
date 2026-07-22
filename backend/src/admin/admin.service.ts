import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  ListUsersQueryDto,
  ResolveReportDto,
  UpdateUserDto,
} from './dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';

import {
  Moderation,
  ReportStatus,
  TransactionType,
  UserStatus,
} from '../common/constants';
import { AUTHOR_SELECT, toStoryResponse } from '../common/utils/story-mapper';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ── Reports ──────────────────────────────────────────────────────────────────

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


  /**
   * Xử lý report (admin).
   *
   * Các action hỗ trợ:
   * • HIDE_COMMENT  — ẩn bình luận vi phạm
   * • REJECT_STORY  — chuyển truyện về REJECTED (hết hiển thị công khai)
   * • BAN_USER      — khoá tài khoản người vi phạm (tác giả/comment)
   */
  async resolveReport(id: string, dto: ResolveReportDto, admin: AuthUser) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        comment: { select: { userId: true } },
        story:   { select: { authorId: true } },
      },
    });
    if (!report) {
      throw new NotFoundException('Report không tồn tại');
    }
    if (report.status !== ReportStatus.OPEN) {
      throw new BadRequestException('Report này đã được xử lý rồi');
    }

    // ── Thực thi hành động đi kèm (chỉ khi RESOLVED, không áp dụng cho DISMISSED) ──
    if (dto.status === 'RESOLVED' && dto.action) {
      if (dto.action === 'HIDE_COMMENT' && report.commentId) {
        await this.prisma.comment.update({
          data: { hidden: true },
          where: { id: report.commentId },
        });
      }

      if (dto.action === 'REJECT_STORY' && report.storyId) {
        await this.prisma.story.update({
          data: { moderation: Moderation.REJECTED },
          where: { id: report.storyId },
        });
      }

      if (dto.action === 'BAN_USER') {
        // Xác định user vi phạm: ưu tiên comment.userId, sau đó story.authorId
        const targetUserId = report.comment?.userId ?? report.story?.authorId;
        if (!targetUserId) {
          throw new BadRequestException(
            'Không xác định được user vi phạm từ report này',
          );
        }
        if (targetUserId === admin.id) {
          throw new ForbiddenException('Không thể tự khoá tài khoản của chính mình');
        }
        await this.prisma.user.update({
          data: { status: UserStatus.BANNED },
          where: { id: targetUserId },
        });
      }
    }


    // ── Đánh dấu report đã xử lý ───────────────────────────────────────────
    return this.prisma.report.update({
      data: {
        resolvedAt: new Date(),
        resolvedById: admin.id,
        status: dto.status,
      },
      where: { id },
    });
  }

  // ── Stories ──────────────────────────────────────────────────────────────────

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

  /**
   * Duyệt / từ chối truyện (admin).
   * Khi REJECTED, bắt buộc phải có `note` ghi lý do để tác giả biết.
   */
  async moderateStory(id: string, moderation: string, note?: string) {
    if (moderation === Moderation.REJECTED && !note?.trim()) {
      throw new BadRequestException(
        'Cần ghi rõ lý do từ chối (note) khi REJECTED',
      );
    }

    const story = await this.prisma.story.findUnique({ where: { id } });
    if (!story) {
      throw new NotFoundException('Truyện không tồn tại');
    }

    const updated = await this.prisma.story.update({
      data: { moderation },
      where: { id },
    });

    if (moderation === Moderation.APPROVED) {
      await this.notificationsService.createNotification(
        story.authorId,
        'Truyện đã được duyệt',
        `Truyện "${story.title}" của bạn đã được duyệt và công khai.`,
      );
    } else if (moderation === Moderation.REJECTED) {
      await this.notificationsService.createNotification(
        story.authorId,
        'Truyện bị từ chối duyệt',
        `Truyện "${story.title}" của bạn đã bị từ chối duyệt. Lý do: ${note?.trim() || 'Không có lý do được cung cấp'}`,
      );
    }

    return updated;
  }

  // ── Users ─────────────────────────────────────────────────────────────────────

  /**
   * Danh sách user có phân trang + tìm kiếm theo tên / email / handle.
   */
  async listUsers(query: ListUsersQueryDto) {
    const page  = query.page  ?? 1;
    const limit = query.limit ?? 20;

    const where = query.q
      ? {
          OR: [
            { name:   { contains: query.q } },
            { email:  { contains: query.q } },
            { handle: { contains: query.q } },
          ],
        }
      : undefined;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          _count:        { select: { stories: true } },
          avatarUri:     true,
          coinBalance:   true,
          createdAt:     true,
          email:         true,
          emailVerified: true,
          handle:        true,
          id:            true,
          name:          true,
          role:          true,
          status:        true,
        },
        skip:  (page - 1) * limit,
        take:  limit,
        where,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, limit, page, total };
  }

  /**
   * Khoá / mở tài khoản hoặc đổi vai trò user (admin).
   *
   * Guard: admin không thể tự cập nhật chính mình để tránh mất quyền.
   */
  async updateUser(id: string, dto: UpdateUserDto, admin: AuthUser) {
    if (id === admin.id) {
      throw new ForbiddenException(
        'Không thể tự thay đổi vai trò / trạng thái của chính mình',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return this.prisma.user.update({
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.role   && { role:   dto.role   }),
      },
      select: {
        email:  true,
        handle: true,
        id:     true,
        name:   true,
        role:   true,
        status: true,
      },
      where: { id },
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────

  /**
   * Thống kê toàn app (admin dashboard).
   * Mở rộng: thêm activeUsers30d và newUsersThisMonth.
   */
  async stats() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1_000);
    const startOfMonth  = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const [
      usersCount,
      storiesCount,
      pendingStories,
      chaptersCount,
      commentsCount,
      openReports,
      topupAgg,
      unlockAgg,
      newUsersThisMonth,
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
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    // Đếm số user duy nhất có hoạt động đọc trong 30 ngày gần nhất
    // (groupBy không dùng được trong array transaction nên chạy riêng)
    const activeUsers30dRaw = await this.prisma.readingProgress.groupBy({
      by: ['userId'],
      where: { updatedAt: { gte: thirtyDaysAgo } },
    });
    const activeUsers30d = activeUsers30dRaw.length;

    return {
      activeUsers30d,
      chaptersCount,
      coinsSpentOnUnlocks: Math.abs(unlockAgg._sum.amount ?? 0),
      coinsToppedUp: topupAgg._sum.amount ?? 0,
      commentsCount,
      newUsersThisMonth,
      openReports,
      pendingStories,
      storiesCount,
      usersCount,
    };
  }
}
