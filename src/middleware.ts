import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // v1 API는 각 라우트에서 인증 처리 (requireAuth 사용)
  // 여기서는 CORS 헤더만 추가 (모바일 앱 대응)
  if (pathname.startsWith('/api/v1/')) {
    const response = NextResponse.next();

    // CORS 헤더 — 모바일 앱에서의 API 호출 허용
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Id');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  }

  return NextResponse.next();
}

// OPTIONS 프리플라이트 처리
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Device-Id',
    },
  });
}

export const config = {
  matcher: ['/api/v1/:path*'],
};
