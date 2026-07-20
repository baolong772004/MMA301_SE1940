import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Đánh dấu route không cần JWT. Nếu client vẫn gửi token hợp lệ, req.user vẫn được gắn (optional auth). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
