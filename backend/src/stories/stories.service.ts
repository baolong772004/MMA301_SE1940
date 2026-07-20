import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

import type {
  CreateChapterDto,
  CreateStoryDto,
  StoryQueryDto,
  UpdateStoryDto,
} from './dto';
import type { AuthUser } from '../common/decorators/current-user.decorator';

import {
  BookSource,
  ChapterStatus,
  Moderation,
  Roles,
  Visibility,
} from '../common/constants';
import {
  AUTHOR_SELECT,
  toStoryResponse,
} from '../common/utils/story-mapper';
import { PrismaService } from '../prisma/prisma.service';

export const CHAPTER_META_SELECT = {
  autoSavedAt: true,
  coinPrice: true,
  createdAt: true,
  id: true,
  index: true,
  isVip: true,
  pageEnd: true,
  pageStart: true,
  publishedAt: true,
  status: true,
  storyId: true,
  title: true,
  wordCount: true,
} as const;

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStoryDto, user: AuthUser) {
    const story = await this.prisma.story.create({
      data: {
        authorId: user.id,
        coverUri: dto.coverUri ?? '',
        description: dto.description ?? '',
        genres: JSON.stringify(dto.genres ?? []),
        status: dto.status ?? 'ongoing',
        title: dto.title,
      },
      include: { author: { select: AUTHOR_SELECT } },
    });
    // Tạo truyện đầu tiên -> lên vai trò WRITER
    if (user.role === Roles.READER) {
      await this.prisma.user.update({
        data: { role: Roles.WRITER },
        where: { id: user.id },
      });
    }
    return toStoryResponse(story);
  }

  async createChapter(storyId: string, dto: CreateChapterDto, user: AuthUser) {
    await this.assertOwner(storyId, user);
    const last = await this.prisma.chapter.findFirst({
      orderBy: { index: 'desc' },
      where: { storyId },
    });
    return this.prisma.chapter.create({
      data: {
        coinPrice: dto.coinPrice ?? 0,
        content: dto.content ?? '',
        index: (last?.index ?? 0) + 1,
        isVip: dto.isVip ?? false,
        storyId,
        title: dto.title,
      },
      select: CHAPTER_META_SELECT,
    });
  }

  async detail(id: string, user?: AuthUser) {
    const story = await this.prisma.story.findUnique({
      include: { author: { select: AUTHOR_SELECT } },
      where: { id },
    });
    if (!story) {
      throw new NotFoundException('Truyện không tồn tại');
    }
    const isOwner =
      user && (user.id === story.authorId || user.role === Roles.ADMIN);
    if (story.moderation !== Moderation.APPROVED && !isOwner) {
      throw new NotFoundException('Truyện không tồn tại');
    }
    if (story.visibility === Visibility.PRIVATE && !isOwner) {
      throw new NotFoundException('Truyện không tồn tại');
    }

    const chapters = await this.prisma.chapter.findMany({
      orderBy: { index: 'asc' },
      select: CHAPTER_META_SELECT,
      where: {
        storyId: id,
        ...(isOwner ? {} : { status: ChapterStatus.PUBLISHED }),
      },
    });

    // Đếm view mỗi lần mở chi tiết (không chờ kết quả)
    void this.prisma.story
      .update({ data: { viewCount: { increment: 1 } }, where: { id } })
      .catch(() => undefined);

    let myRating: null | number = null;
    if (user) {
      const rating = await this.prisma.rating.findUnique({
        where: { userId_storyId: { storyId: id, userId: user.id } },
      });
      myRating = rating?.stars ?? null;
    }

    return { ...toStoryResponse(story), chapters, myRating };
  }

  async list(query: StoryQueryDto, user?: AuthUser) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      moderation: Moderation.APPROVED,
      visibility: Visibility.PUBLIC,
      ...(query.q && { title: { contains: query.q } }),
      ...(query.genre && { genres: { contains: `"${query.genre}"` } }),
      ...(query.status && { status: query.status }),
    };

    const orderBy =
      query.sort === 'rating'
        ? { ratingAvg: 'desc' as const }
        : query.sort === 'views'
          ? { viewCount: 'desc' as const }
          : { createdAt: 'desc' as const };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.story.findMany({
        include: { author: { select: AUTHOR_SELECT } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        where,
      }),
      this.prisma.story.count({ where }),
    ]);

    return {
      items: items.map((story) => toStoryResponse(story)),
      limit,
      page,
      total,
    };
  }

  async listMine(user: AuthUser) {
    const stories = await this.prisma.story.findMany({
      include: {
        _count: { select: { chapters: true } },
        author: { select: AUTHOR_SELECT },
      },
      orderBy: { updatedAt: 'desc' },
      where: { authorId: user.id },
    });
    return stories.map((story) => ({
      ...toStoryResponse(story),
      chaptersCount: story._count.chapters,
    }));
  }

  async rate(storyId: string, stars: number, user: AuthUser) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });
    if (!story || story.moderation !== Moderation.APPROVED) {
      throw new NotFoundException('Truyện không tồn tại');
    }
    await this.prisma.rating.upsert({
      create: { stars, storyId, userId: user.id },
      update: { stars },
      where: { userId_storyId: { storyId, userId: user.id } },
    });
    const agg = await this.prisma.rating.aggregate({
      _avg: { stars: true },
      _count: true,
      _sum: { stars: true },
      where: { storyId },
    });
    const updated = await this.prisma.story.update({
      data: {
        ratingAvg: agg._avg.stars ?? 0,
        ratingCount: agg._count,
        ratingSum: agg._sum.stars ?? 0,
      },
      where: { id: storyId },
    });
    return {
      myRating: stars,
      rating: Math.round(updated.ratingAvg * 10) / 10,
      ratingCount: updated.ratingCount,
    };
  }

  async remove(id: string, user: AuthUser) {
    const story = await this.assertOwner(id, user);
    await this.prisma.story.delete({ where: { id } });
    if (story.source !== BookSource.ORIGINAL) {
      this.cleanupUploadedFile(story.sourceFileUri);
      this.cleanupUploadedFile(story.coverUri);
    }
    return { message: 'Đã xóa truyện' };
  }

  async update(id: string, dto: UpdateStoryDto, user: AuthUser) {
    await this.assertOwner(id, user);
    const story = await this.prisma.story.update({
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.coverUri !== undefined && { coverUri: dto.coverUri }),
        ...(dto.genres && { genres: JSON.stringify(dto.genres) }),
        ...(dto.status && { status: dto.status }),
      },
      include: { author: { select: AUTHOR_SELECT } },
      where: { id },
    });
    return toStoryResponse(story);
  }

  private async assertOwner(storyId: string, user: AuthUser) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });
    if (!story) {
      throw new NotFoundException('Truyện không tồn tại');
    }
    if (story.authorId !== user.id && user.role !== Roles.ADMIN) {
      throw new ForbiddenException('Bạn không phải tác giả truyện này');
    }
    return story;
  }

  /** Xóa file gốc/bìa đã upload khi xóa sách import (best-effort, không chặn response). */
  private cleanupUploadedFile(uri: null | string | undefined) {
    if (!uri) return;
    try {
      const relative = uri.replace(/^https?:\/\/[^/]+/, '');
      if (!relative.startsWith('/uploads/')) return;
      const filePath = join(process.cwd(), relative);
      if (existsSync(filePath)) unlinkSync(filePath);
    } catch {
      // best-effort — không chặn việc xóa truyện nếu dọn file thất bại
    }
  }
}
