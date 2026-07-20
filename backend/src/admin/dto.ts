import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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

export class ModerateStoryDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  moderation: string;
}

export class CreateReportDto {
  @ApiPropertyOptional({ description: 'ID truyện bị báo cáo' })
  @IsOptional()
  @IsString()
  storyId?: string;

  @ApiPropertyOptional({ description: 'ID bình luận bị báo cáo' })
  @IsOptional()
  @IsString()
  commentId?: string;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  @MinLength(1)
  reason: string;
}

export class ResolveReportDto {
  @ApiProperty({ enum: ['RESOLVED', 'DISMISSED'] })
  @IsIn(['RESOLVED', 'DISMISSED'])
  status: string;

  @ApiPropertyOptional({
    description: 'RESOLVED kèm hành động: ẩn bình luận bị báo cáo',
  })
  @IsIn(['HIDE_COMMENT'])
  @IsOptional()
  action?: string;
}
