import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsString, Max, Min } from 'class-validator';

export class SetShelfDto {
  @ApiProperty({ enum: ['READING', 'SAVED', 'COMPLETED'] })
  @IsIn(['READING', 'SAVED', 'COMPLETED'])
  shelf: string;
}

export class UpsertProgressDto {
  @ApiProperty({ description: 'Chương đang đọc' })
  @IsString()
  chapterId: string;

  @ApiProperty({ description: 'Vị trí cuộn 0..1' })
  @IsNumber()
  @Max(1)
  @Min(0)
  @Type(() => Number)
  position: number;
}
