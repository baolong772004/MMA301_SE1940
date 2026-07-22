import { instance } from '@/services/instance';
import { walletResponseSchema, WalletResponse } from './schema';

export const WalletServices = {
  /**
   * Số dư xu + lịch sử giao dịch (GET /wallet)
   */
  getWallet: async (): Promise<WalletResponse> => {
    const response = await instance.get('wallet').json();
    return walletResponseSchema.parse(response);
  },

  /**
   * Nạp xu (thanh toán giả lập) (POST /wallet/topup)
   */
  topup: async (amount: number, method: string = 'CARD') => {
    const response = await instance
      .post('wallet/topup', {
        json: { amount, method },
      })
      .json<{ coinBalance: number; message: string }>();
    return response;
  },
};
