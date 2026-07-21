import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

/**
 * AdminModule — quản lý toàn bộ nghiệp vụ admin-only.
 * createReport (mọi user) đã được tách sang ReportsModule (/reports).
 */
@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
