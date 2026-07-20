import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserStatus } from '../constants';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Thiếu access token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.prisma.user.findUnique({
        select: {
          avatarUri: true,
          coinBalance: true,
          email: true,
          emailVerified: true,
          handle: true,
          id: true,
          name: true,
          role: true,
          status: true,
        },
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }
      if (user.status === UserStatus.BANNED) {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }
      request.user = user;
      return true;
    } catch (error) {
      if (isPublic) {
        return true;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Access token không hợp lệ');
    }
  }

  private extractToken(request: {
    headers: Record<string, string | undefined>;
  }): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
