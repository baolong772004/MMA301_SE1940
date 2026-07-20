import { Injectable } from '@nestjs/common';

import type { AuthUser } from '../common/decorators/current-user.decorator';

import { TransactionType } from '../common/constants';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async get(user: AuthUser) {
    const [account, transactions] = await this.prisma.$transaction([
      this.prisma.user.findUniqueOrThrow({
        select: { coinBalance: true },
        where: { id: user.id },
      }),
      this.prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        where: { userId: user.id },
      }),
    ]);
    return { coinBalance: account.coinBalance, transactions };
  }

  /**
   * Nạp xu (F6). Cổng thanh toán thật chưa tích hợp — giả lập thanh toán
   * thành công ngay; khi có cổng thật, thay bằng flow tạo đơn + webhook xác nhận.
   */
  async topup(amount: number, method: string, user: AuthUser) {
    const [updated] = await this.prisma.$transaction([
      this.prisma.user.update({
        data: { coinBalance: { increment: amount } },
        where: { id: user.id },
      }),
      this.prisma.transaction.create({
        data: {
          amount,
          description: `Nạp ${amount} xu qua ${method}`,
          type: TransactionType.TOPUP,
          userId: user.id,
        },
      }),
    ]);
    return { coinBalance: updated.coinBalance, message: 'Nạp xu thành công' };
  }
}
