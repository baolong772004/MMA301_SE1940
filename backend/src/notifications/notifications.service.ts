import { Injectable, NotFoundException } from '@nestjs/common';

import type { AuthUser } from '../common/decorators/current-user.decorator';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo thông báo mới cho một user.
   */
  async createNotification(userId: string, title: string, body: string) {
    return this.prisma.notification.create({
      data: {
        body,
        title,
        userId,
      },
    });
  }

  /**
   * Lấy danh sách thông báo của user hiện tại, sắp xếp mới nhất lên đầu.
   */
  async listNotifications(user: AuthUser) {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      where: { userId: user.id },
    });
  }

  /**
   * Đánh dấu thông báo là đã đọc.
   */
  async markAsRead(id: string, user: AuthUser) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId: user.id },
    });
    if (!notification) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    return this.prisma.notification.update({
      data: { read: true },
      where: { id },
    });
  }

  /**
   * Đánh dấu tất cả thông báo của user là đã đọc.
   */
  async markAllAsRead(user: AuthUser) {
    await this.prisma.notification.updateMany({
      data: { read: true },
      where: { read: false, userId: user.id },
    });
    return { message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
  }
}
