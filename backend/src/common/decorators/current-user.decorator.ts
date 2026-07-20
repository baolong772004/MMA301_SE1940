import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthUser = {
  avatarUri: null | string;
  coinBalance: number;
  email: string;
  emailVerified: boolean;
  handle: string;
  id: string;
  name: string;
  role: string;
  status: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
