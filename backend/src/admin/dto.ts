import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// ── UpdateUserDto ──────────────────────────────────────────────────────────────
export class UpdateUserDto {
  @ApiPropertyOptional({ enum: ['ACTIVE', 'BANNED'] })
  @IsIn(['ACTIVE', 'BANNED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: ['READER', 'WRITER', 'ADMIN'] })
  @IsIn(['READER', 'WRITER', 'ADMIN'])
  @IsOptional()
  role?: string;
}

// ── ModerateStoryDto ───────────────────────────────────────────────────────────
export class ModerateStoryDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  moderation: string;

  /**
   * Lý do từ chối — bắt buộc khi moderation = 'REJECTED' (kiểm tra ở service).
   */
  @ApiPropertyOptional({
    description: 'Lý do từ chối (bắt buộc khi REJECTED)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

// ── ResolveReportDto ───────────────────────────────────────────────────────────
export class ResolveReportDto {
  @ApiProperty({ enum: ['RESOLVED', 'DISMISSED'] })
  @IsIn(['RESOLVED', 'DISMISSED'])
  status: string;

  @ApiPropertyOptional({
    description:
      'Hành động kèm theo khi RESOLVED:\n' +
      '• HIDE_COMMENT — ẩn bình luận bị báo cáo\n' +
      '• REJECT_STORY — từ chối truyện bị báo cáo\n' +
      '• BAN_USER — khoá tài khoản người vi phạm',
    enum: ['HIDE_COMMENT', 'REJECT_STORY', 'BAN_USER'],
  })
  @IsIn(['HIDE_COMMENT', 'REJECT_STORY', 'BAN_USER'])
  @IsOptional()
  action?: string;
}

// ── ListUsersQueryDto ──────────────────────────────────────────────────────────
export class ListUsersQueryDto {
  @ApiPropertyOptional({ description: 'Tìm theo tên, email hoặc handle' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100, minimum: 1 })
  @IsInt()
  @IsOptional()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
