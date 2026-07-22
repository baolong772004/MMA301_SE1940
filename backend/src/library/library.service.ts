import { Injectable, NotFoundException } from '@nestjs/common';

import type { AuthUser } from '../common/decorators/current-user.decorator';

import { ChapterStatus, Moderation } from '../common/constants';
import {
  AUTHOR_SELECT,
  toStoryResponse,
} from '../common/utils/story-mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  /** Danh sách "Đang đọc dở" cho Home (ContinueReadingCard). */
  async continueReading(user: AuthUser) {
    const progresses = await this.prisma.readingProgress.findMany({
      include: {
        chapter: { select: { id: true, index: true, title: true } },
        story: { include: { author: { select: AUTHOR_SELECT } } },
      },
      orderBy: { updatedAt: 'desc' },
      where: { userId: user.id },
    });
    return progresses.map((progress) => ({
      chapter: progress.chapter,
      chapterLabel: `Ch. ${progress.chapter.index}: ${progress.chapter.title}`,
      position: progress.position,
      story: toStoryResponse(progress.story),
      updatedAt: progress.updatedAt,
    }));
  }

  async getProgress(storyId: string, user: AuthUser) {
    const progress = await this.prisma.readingProgress.findUnique({
      include: { chapter: { select: { id: true, index: true, title: true } } },
      where: { userId_storyId: { storyId, userId: user.id } },
    });
    return progress ?? null;
  }

  /** Thư viện cá nhân, nhóm theo kệ (Reading / Saved / Completed). */
  async list(user: AuthUser) {
    const entries = await this.prisma.libraryEntry.findMany({
      include: { story: { include: { author: { select: AUTHOR_SELECT } } } },
      orderBy: { createdAt: 'desc' },
      where: { userId: user.id },
    });
    const grouped: Record<string, unknown[]> = {
      COMPLETED: [],
      READING: [],
      SAVED: [],
    };
    for (const entry of entries) {
      (grouped[entry.shelf] ?? grouped.SAVED).push({
        addedAt: entry.createdAt,
        shelf: entry.shelf,
        story: toStoryResponse(entry.story),
      });
    }
    return grouped;
  }

  async remove(storyId: string, user: AuthUser) {
    await this.prisma.libraryEntry.deleteMany({
      where: { storyId, userId: user.id },
    });
    return { message: 'Đã xóa khỏi thư viện' };
  }

  async setShelf(storyId: string, shelf: string, user: AuthUser) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });
    if (!story || story.moderation !== Moderation.APPROVED) {
      throw new NotFoundException('Truyện không tồn tại');
    }
    return this.prisma.libraryEntry.upsert({
      create: { shelf, storyId, userId: user.id },
      update: { shelf },
      where: { userId_storyId: { storyId, userId: user.id } },
    });
  }

  /** Lưu vị trí đọc dở (FR1) — tự thêm truyện vào kệ READING nếu chưa có. */
  async upsertProgress(
    storyId: string,
    chapterId: string,
    position: number,
    user: AuthUser,
  ) {
    const chapter = await this.prisma.chapter.findFirst({
      where: { id: chapterId, status: ChapterStatus.PUBLISHED, storyId },
    });
    if (!chapter) {
      throw new NotFoundException('Chương không tồn tại trong truyện này');
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return this.prisma.$transaction(async (tx) => {
      const userData = await tx.user.findUniqueOrThrow({
        select: { currentStreak: true, longestStreak: true, lastReadAt: true, totalReadingDays: true },
        where: { id: user.id },
      });

      let newCurrentStreak = userData.currentStreak;
      let newLongestStreak = userData.longestStreak;
      let shouldUpdateStreak = false;

      if (userData.lastReadAt) {
        const lastReadStr = userData.lastReadAt.toISOString().slice(0, 10);
        if (lastReadStr !== todayStr) {
          const lastReadDate = new Date(lastReadStr);
          const todayDate = new Date(todayStr);
          const diffMs = todayDate.getTime() - lastReadDate.getTime();
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newCurrentStreak = userData.currentStreak + 1;
          } else {
            newCurrentStreak = 1;
          }
          shouldUpdateStreak = true;
        }
      } else {
        newCurrentStreak = 1;
        shouldUpdateStreak = true;
      }

      if (shouldUpdateStreak) {
        if (newCurrentStreak > newLongestStreak) {
          newLongestStreak = newCurrentStreak;
        }
        await tx.user.update({
          data: {
            currentStreak: newCurrentStreak,
            lastReadAt: now,
            longestStreak: newLongestStreak,
            totalReadingDays: { increment: 1 }, // +1 ngày đọc mới
          },
          where: { id: user.id },
        });
      } else {
        await tx.user.update({
          data: { lastReadAt: now },
          where: { id: user.id },
        });
      }

      const progress = await tx.readingProgress.upsert({
        create: { chapterId, position, storyId, userId: user.id },
        update: { chapterId, position },
        where: { userId_storyId: { storyId, userId: user.id } },
      });

      await tx.libraryEntry.upsert({
        create: { shelf: 'READING', storyId, userId: user.id },
        update: {},
        where: { userId_storyId: { storyId, userId: user.id } },
      });

      return progress;
    });
  }
}
