import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'reader@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Reader@123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password: string;

  @ApiProperty({ example: 'Quang Le' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name: string;

  @ApiPropertyOptional({ example: 'quangle' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,30}$/, {
    message: 'handle chỉ gồm chữ, số, gạch dưới (3-30 ký tự)',
  })
  handle?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'reader@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Reader@123' })
  @IsString()
  password: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'reader@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class ResendOtpDto {
  @ApiProperty({ example: 'reader@example.com' })
  @IsEmail()
  email: string;
}
