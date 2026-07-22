import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import type { LoginDto, RegisterDto, VerifyOtpDto } from './dto';

import { UserStatus } from '../common/constants';
import { PrismaService } from '../prisma/prisma.service';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 phút

const PUBLIC_USER_SELECT = {
  avatarUri: true,
  coinBalance: true,
  createdAt: true,
  email: true,
  emailVerified: true,
  handle: true,
  id: true,
  name: true,
  role: true,
  status: true,
} as const;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Tài khoản chưa xác thực email. Vui lòng nhập OTP.',
      );
    }
    return this.buildAuthResponse(user.id);
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      select: PUBLIC_USER_SELECT,
      where: { id: userId },
    });
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email đã được đăng ký');
    }

    const handle = dto.handle ?? (await this.suggestHandle(dto.name));
    const handleTaken = await this.prisma.user.findUnique({
      where: { handle },
    });
    if (handleTaken) {
      throw new ConflictException('Handle đã được sử dụng');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        handle,
        name: dto.name,
        password: await bcrypt.hash(dto.password, 10),
      },
    });

    const devOtp = await this.issueOtp(user.id, email);
    return {
      message: 'Đăng ký thành công. Kiểm tra email để lấy mã OTP.',
      // Chưa tích hợp SMTP nên trả OTP ra response ở môi trường dev để demo.
      ...(process.env.NODE_ENV !== 'production' && { devOtp }),
      email,
    };
  }

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      throw new BadRequestException('Email chưa đăng ký');
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email đã xác thực');
    }
    const devOtp = await this.issueOtp(user.id, user.email);
    return {
      message: 'Đã gửi lại mã OTP.',
      ...(process.env.NODE_ENV !== 'production' && { devOtp }),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new BadRequestException('Email chưa đăng ký');
    }
    const otp = await this.prisma.otpCode.findFirst({
      orderBy: { createdAt: 'desc' },
      where: {
        code: dto.code,
        consumedAt: null,
        expiresAt: { gt: new Date() },
        userId: user.id,
      },
    });
    if (!otp) {
      throw new BadRequestException('Mã OTP không đúng hoặc đã hết hạn');
    }
    await this.prisma.$transaction([
      this.prisma.otpCode.update({
        data: { consumedAt: new Date() },
        where: { id: otp.id },
      }),
      this.prisma.user.update({
        data: { emailVerified: true },
        where: { id: user.id },
      }),
    ]);
    return this.buildAuthResponse(user.id);
  }

  private async buildAuthResponse(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      select: PUBLIC_USER_SELECT,
      where: { id: userId },
    });
    const accessToken = await this.jwtService.signAsync({
      role: user.role,
      sub: user.id,
    });
    return { accessToken, user };
  }

  private async issueOtp(userId: string, email: string) {
    const code = Math.floor(100_000 + Math.random() * 900_000).toString();
    await this.prisma.otpCode.create({
      data: {
        code,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        userId,
      },
    });
    // Khi có SMTP thật, thay log này bằng gửi email.
    this.logger.log(`[OTP] ${email} -> ${code}`);
    return code;
  }

  private async suggestHandle(name: string) {
    const base =
      name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase()
        .slice(0, 20) || 'user';
    let handle = base;
    let attempt = 0;
    while (await this.prisma.user.findUnique({ where: { handle } })) {
      attempt += 1;
      handle = `${base}${Math.floor(Math.random() * 10_000)}`;
      if (attempt > 20) {
        handle = `${base}${Date.now()}`;
        break;
      }
    }
    return handle;
  }
}
