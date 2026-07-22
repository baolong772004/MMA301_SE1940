import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class StoryQueryDto {
  @ApiPropertyOptional({ description: 'Tìm theo tiêu đề' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Lọc theo thể loại, vd: Fantasy' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ enum: ['ongoing', 'completed'] })
  @IsIn(['ongoing', 'completed'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ enum: ['newest', 'rating', 'views'] })
  @IsIn(['newest', 'rating', 'views'])
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @IsOptional()
  @Max(50)
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}

export class CreateStoryDto {
  @IsString()
  @MaxLength(120)
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  coverUri?: string;

  @ApiPropertyOptional({ example: ['Fantasy', 'Adventure'] })
  @ArrayMaxSize(5)
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  genres?: string[];

  @ApiPropertyOptional({ enum: ['ongoing', 'completed'] })
  @IsIn(['ongoing', 'completed'])
  @IsOptional()
  status?: string;
}

export class UpdateStoryDto extends CreateStoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @MinLength(1)
  declare title: string;
}

export class CreateChapterDto {
  @IsString()
  @MaxLength(150)
  @MinLength(1)
  title: string;

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

export class RateStoryDto {
  @IsInt()
  @Max(5)
  @Min(1)
  @Type(() => Number)
  stars: number;

  @ApiPropertyOptional({ description: 'Nội dung nhận xét (tùy chọn)' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;
}

export class RatingQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @IsOptional()
  @Max(50)
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
