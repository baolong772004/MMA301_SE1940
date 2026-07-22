import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { CreateCommentDto, UpdateChapterDto } from './dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';

import {
  ChapterStatus,
  Moderation,
  Roles,
  TransactionType,
} from '../common/constants';
import { censor } from '../common/utils/censor';
import { PrismaService } from '../prisma/prisma.service';
import { CHAPTER_META_SELECT } from '../stories/stories.service';

@Injectable()
export class ChaptersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Nội dung chương: khóa nếu VIP chưa mở; DRAFT chỉ tác giả xem được. */
  async detail(id: string, user?: AuthUser) {
    const chapter = await this.prisma.chapter.findUnique({
      include: {
        story: {
          select: {
            author: { select: { avatarUri: true, handle: true, id: true, name: true } },
            authorId: true,
            id: true,
            moderation: true,
            title: true,
          },
        },
      },
      where: { id },
    });
    if (!chapter) {
      throw new NotFoundException('Chương không tồn tại');
    }

    const isOwner =
      user &&
      (user.id === chapter.story.authorId || user.role === Roles.ADMIN);

    if (
      (chapter.status !== ChapterStatus.PUBLISHED ||
        chapter.story.moderation !== Moderation.APPROVED) &&
      !isOwner
    ) {
      throw new NotFoundException('Chương không tồn tại');
    }

    const [previous, next] = await Promise.all([
      this.findSibling(chapter.storyId, chapter.index, -1, Boolean(isOwner)),
      this.findSibling(chapter.storyId, chapter.index, 1, Boolean(isOwner)),
    ]);

    let locked = false;
    if (chapter.isVip && !isOwner) {
      const unlock = user
        ? await this.prisma.chapterUnlock.findUnique({
            where: {
              userId_chapterId: { chapterId: id, userId: user.id },
            },
          })
        : null;
      locked = !unlock;
    }

    const { content, ...meta } = chapter;
    return {
      ...meta,
      content: locked ? null : content,
      locked,
      nextChapterId: next?.id ?? null,
      previousChapterId: previous?.id ?? null,
    };
  }

  async createComment(chapterId: string, dto: CreateCommentDto, user: AuthUser) {
    const chapter = await this.prisma.chapter.findUnique({
      select: { id: true, status: true },
      where: { id: chapterId },
    });
    if (!chapter || chapter.status !== ChapterStatus.PUBLISHED) {
      throw new NotFoundException('Chương không tồn tại');
    }
    const comment = await this.prisma.comment.create({
      data: {
        chapterId,
        content: censor(dto.content.trim()),
        paragraphIndex: dto.paragraphIndex ?? 0,
        userId: user.id,
      },
      include: {
        user: { select: { avatarUri: true, handle: true, id: true, name: true } },
      },
    });
    return comment;
  }

  async listComments(chapterId: string) {
    return this.prisma.comment.findMany({
      include: {
        user: { select: { avatarUri: true, handle: true, id: true, name: true } },
      },
      orderBy: [{ paragraphIndex: 'asc' }, { createdAt: 'asc' }],
      where: { chapterId, hidden: false },
    });
  }

  async publish(id: string, user: AuthUser) {
    await this.assertOwner(id, user);
    return this.prisma.chapter.update({
      data: { publishedAt: new Date(), status: ChapterStatus.PUBLISHED },
      select: CHAPTER_META_SELECT,
      where: { id },
    });
  }

  async remove(id: string, user: AuthUser) {
    await this.assertOwner(id, user);
    await this.prisma.chapter.delete({ where: { id } });
    return { message: 'Đã xóa chương' };
  }

  /** Auto-save nháp (FR3): frontend gọi mỗi 30s, trả về autoSavedAt. */
  async update(id: string, dto: UpdateChapterDto, user: AuthUser) {
    await this.assertOwner(id, user);
    const chapter = await this.prisma.chapter.update({
      data: {
        autoSavedAt: new Date(),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.isVip !== undefined && { isVip: dto.isVip }),
        ...(dto.coinPrice !== undefined && { coinPrice: dto.coinPrice }),
      },
      select: { ...CHAPTER_META_SELECT, content: true },
      where: { id },
    });
    return chapter;
  }

  /** Mở khóa chương VIP bằng xu (F6). */
  async unlock(id: string, user: AuthUser) {
    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Vui lòng xác thực email trước khi thực hiện giao dịch mở khóa.',
      );
    }
    const chapter = await this.prisma.chapter.findUnique({
      include: { story: { select: { authorId: true, title: true } } },
      where: { id },
    });
    if (!chapter) {
      throw new NotFoundException('Chương không tồn tại');
    }
    if (!chapter.isVip || chapter.story.authorId === user.id) {
      throw new BadRequestException('Chương này không cần mở khóa');
    }
    const existing = await this.prisma.chapterUnlock.findUnique({
      where: { userId_chapterId: { chapterId: id, userId: user.id } },
    });
    if (existing) {
      throw new BadRequestException('Bạn đã mở khóa chương này rồi');
    }

    const price = chapter.coinPrice;
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.user.findUniqueOrThrow({
        select: { coinBalance: true },
        where: { id: user.id },
      });
      if (account.coinBalance < price) {
        throw new BadRequestException(
          `Không đủ xu (cần ${price}, hiện có ${account.coinBalance})`,
        );
      }
      const updated = await tx.user.update({
        data: { coinBalance: { decrement: price } },
        where: { id: user.id },
      });
      await tx.chapterUnlock.create({
        data: { chapterId: id, userId: user.id },
      });
      await tx.transaction.create({
        data: {
          amount: -price,
          chapterId: id,
          description: `Mở khóa "${chapter.title}" — ${chapter.story.title}`,
          type: TransactionType.UNLOCK,
          userId: user.id,
        },
      });
      return { chapterId: id, coinBalance: updated.coinBalance, unlocked: true };
    });
  }

  private async assertOwner(chapterId: string, user: AuthUser) {
    const chapter = await this.prisma.chapter.findUnique({
      include: { story: { select: { authorId: true } } },
      where: { id: chapterId },
    });
    if (!chapter) {
      throw new NotFoundException('Chương không tồn tại');
    }
    if (chapter.story.authorId !== user.id && user.role !== Roles.ADMIN) {
      throw new ForbiddenException('Bạn không phải tác giả truyện này');
    }
    return chapter;
  }

  private findSibling(
    storyId: string,
    index: number,
    direction: -1 | 1,
    includeDrafts: boolean,
  ) {
    return this.prisma.chapter.findFirst({
      orderBy: { index: direction === 1 ? 'asc' : 'desc' },
      select: { id: true },
      where: {
        index: direction === 1 ? { gt: index } : { lt: index },
        storyId,
        ...(includeDrafts ? {} : { status: ChapterStatus.PUBLISHED }),
      },
    });
  }
}
