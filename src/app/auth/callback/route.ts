import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// OAuth redirect 후 code 교환 → 세션 쿠키 설정 → 홈으로
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const errorDesc = url.searchParams.get('error_description');

  const origin = url.origin;

  if (errorDesc) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDesc)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // 코드 교환 — 클라이언트가 세션 저장하므로 서버 쪽은 그냥 / 로 리다이렉트해서
  // 클라이언트의 supabase.auth가 URL의 #access_token= 또는 ?code= 자동 처리하도록 함
  // (Supabase JS v2의 detectSessionInUrl 기본값 true)
  const _ = code;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const temp = createClient(supabaseUrl, anon);
  await temp.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(origin + '/');
}
