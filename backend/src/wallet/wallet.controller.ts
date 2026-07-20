import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { TopupDto } from './dto';
import { WalletService } from './wallet.service';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiBearerAuth()
@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: 'Số dư xu + lịch sử giao dịch' })
  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.walletService.get(user);
  }

  @ApiOperation({ summary: 'Nạp xu (thanh toán giả lập)' })
  @HttpCode(200)
  @Post('topup')
  topup(@Body() dto: TopupDto, @CurrentUser() user: AuthUser) {
    return this.walletService.topup(dto.amount, dto.method ?? 'CARD', user);
  }
}
