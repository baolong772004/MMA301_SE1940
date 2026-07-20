import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class TopupDto {
  @ApiProperty({ description: 'Số xu muốn nạp', example: 100 })
  @IsInt()
  @Max(100_000)
  @Min(1)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Cổng thanh toán giả lập',
    enum: ['MOMO', 'ZALOPAY', 'CARD'],
  })
  @IsIn(['MOMO', 'ZALOPAY', 'CARD'])
  @IsOptional()
  method?: string;
}
