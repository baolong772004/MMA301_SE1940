import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO để bất kỳ user đã đăng nhập nào gửi report vi phạm.
 * Cần cung cấp storyId HOẶC commentId (không được để cả hai trống).
 */
export class CreateReportDto {
  @ApiPropertyOptional({ description: 'ID truyện bị báo cáo' })
  @IsOptional()
  @IsString()
  storyId?: string;

  @ApiPropertyOptional({ description: 'ID bình luận bị báo cáo' })
  @IsOptional()
  @IsString()
  commentId?: string;

  @ApiProperty({ description: 'Lý do báo cáo', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @MinLength(1)
  reason: string;
}
