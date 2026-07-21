import * as z from 'zod';
import { instance } from '@/services/instance';
import {
  authResponseSchema,
  loginSchema,
  registerResponseSchema,
  registerSchema,
  resendOtpSchema,
  userSchema,
  verifyOtpSchema,
  RegisterResponse,
} from './schema';

export const parseApiError = async (err: unknown, defaultMsg = 'Đã xảy ra lỗi'): Promise<string> => {
  if (err && typeof err === 'object' && 'response' in err) {
    try {
      const response = (err as { response: Response }).response;
      const data = (await response.json()) as { message?: string | string[] };
      if (data?.message) {
        return Array.isArray(data.message) ? data.message.join(', ') : data.message;
      }
    } catch {
      // Fall through if json parsing fails
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return defaultMsg;
};

export const AuthServices = {
  register: async (input: z.infer<typeof registerSchema>): Promise<RegisterResponse> => {
    const response = await instance.post('auth/register', { json: input }).json();
    return registerResponseSchema.parse(response);
  },

  resendOtp: async (input: z.infer<typeof resendOtpSchema>) => {
    const response = await instance.post('auth/resend-otp', { json: input }).json();
    return response as { message: string; devOtp?: string };
  },

  verifyOtp: async (input: z.infer<typeof verifyOtpSchema>) => {
    const response = await instance.post('auth/verify-otp', { json: input }).json();
    return authResponseSchema.parse(response);
  },

  login: async (input: z.infer<typeof loginSchema>) => {
    const response = await instance.post('auth/login', { json: input }).json();
    return authResponseSchema.parse(response);
  },

  getMe: async () => {
    const response = await instance.get('auth/me').json();
    return userSchema.parse(response);
  },
};
