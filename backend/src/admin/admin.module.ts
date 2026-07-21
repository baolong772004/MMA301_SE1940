import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * AdminModule — quản lý toàn bộ nghiệp vụ admin-only.
 * createReport (mọi user) đã được tách sang ReportsModule (/reports).
 */
@Module({
  controllers: [AdminController],
  imports: [NotificationsModule],
  providers: [AdminService],
})
export class AdminModule {}
