import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResendOtpDto, VerifyOtpDto } from './dto';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Đăng ký tài khoản (gửi OTP)' })
  @Post('register')
  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Xác thực OTP, trả về JWT' })
  @HttpCode(200)
  @Post('verify-otp')
  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @ApiOperation({ summary: 'Gửi lại OTP' })
  @HttpCode(200)
  @Post('resend-otp')
  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email);
  }

  @ApiOperation({ summary: 'Đăng nhập email + mật khẩu, trả về JWT' })
  @HttpCode(200)
  @Post('login')
  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thông tin tài khoản hiện tại' })
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }
}
