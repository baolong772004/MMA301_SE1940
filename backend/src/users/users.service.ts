import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { AuthUser } from '../common/decorators/current-user.decorator';

import { Moderation } from '../common/constants';
import {
  AUTHOR_SELECT,
  toStoryResponse,
} from '../common/utils/story-mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(user: AuthUser, dto: { name?: string; avatarUri?: string; handle?: string }) {
    const updated = await this.prisma.user.update({
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.handle && { handle: dto.handle }),
        ...(dto.avatarUri !== undefined && { avatarUri: dto.avatarUri }),
      },
      where: { id: user.id },
    });
    return updated;
  }

  async follow(targetId: string, user: AuthUser) {
    if (targetId === user.id) {
      throw new BadRequestException('Không thể tự theo dõi chính mình');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!target) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    await this.prisma.follow.upsert({
      create: { followerId: user.id, followingId: targetId },
      update: {},
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetId,
        },
      },
    });
    return { following: true };
  }

  /** Hồ sơ công khai của tác giả / người dùng. */
  async profile(id: string, viewer?: AuthUser) {
    const user = await this.prisma.user.findUnique({
      select: {
        _count: {
          select: {
            followers: true,
            following: true,
            stories: { where: { moderation: Moderation.APPROVED } },
          },
        },
        avatarUri: true,
        createdAt: true,
        handle: true,
        id: true,
        name: true,
        role: true,
      },
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    let isFollowing = false;
    if (viewer && viewer.id !== id) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: viewer.id, followingId: id },
        },
      });
      isFollowing = Boolean(follow);
    }
    const { _count, ...rest } = user;
    return {
      ...rest,
      followersCount: _count.followers,
      followingCount: _count.following,
      isFollowing,
      storiesCount: _count.stories,
    };
  }

  /** Truyện công khai của một tác giả. */
  async stories(id: string) {
    const stories = await this.prisma.story.findMany({
      include: { author: { select: AUTHOR_SELECT } },
      orderBy: { updatedAt: 'desc' },
      where: { authorId: id, moderation: Moderation.APPROVED },
    });
    return stories.map((story) => toStoryResponse(story));
  }

  async unfollow(targetId: string, user: AuthUser) {
    await this.prisma.follow.deleteMany({
      where: { followerId: user.id, followingId: targetId },
    });
    return { following: false };
  }

  async getStreak(user: AuthUser) {
    const userData = await this.prisma.user.findUniqueOrThrow({
      select: {
        currentStreak: true,
        longestStreak: true,
        totalReadingDays: true,
      },
      where: { id: user.id },
    });

    return {
      currentStreak: userData.currentStreak,
      longestStreak: userData.longestStreak,
      totalReadingDays: userData.totalReadingDays,
    };
  }
}
