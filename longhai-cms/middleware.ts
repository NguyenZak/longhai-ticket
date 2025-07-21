import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Vô hiệu hóa toàn bộ logic bảo vệ route, luôn cho phép truy cập
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/news/:path*',
    '/users/:path*',
    '/bookings/:path*',
    '/events/:path*',
    '/banners/:path*',
    '/profile/:path*',
    '/settings/:path*',
    // ... thêm các route cần bảo vệ
  ],
}; 