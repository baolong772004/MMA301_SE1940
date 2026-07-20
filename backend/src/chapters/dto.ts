import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateChapterDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @Type(() => Boolean)
  isVip?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  coinPrice?: number;
}

export class CreateCommentDto {
  @ApiProperty({ description: 'Chỉ số đoạn văn trong chương (bắt đầu từ 0)' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  paragraphIndex: number;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500, { message: 'Bình luận tối đa 500 ký tự' })
  @MinLength(1, { message: 'Bình luận không được để trống' })
  content: string;
}
