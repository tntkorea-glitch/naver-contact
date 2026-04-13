import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/api-auth';
import { apiError, apiSuccess, ErrorCodes } from '@/lib/errors';

// POST /api/v1/auth/register — 디바이스 등록
export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  const { device_name, device_type, push_token } = await request.json();

  if (!device_name || !device_type) {
    return apiError(ErrorCodes.VALIDATION, 'device_name과 device_type이 필요합니다');
  }

  if (!['web', 'ios', 'android'].includes(device_type)) {
    return apiError(ErrorCodes.VALIDATION, 'device_type은 web, ios, android 중 하나여야 합니다');
  }

  const { data, error: dbError } = await supabase
    .from('devices')
    .insert({
      user_id: user!.id,
      device_name,
      device_type,
      push_token: push_token || null,
    })
    .select()
    .single();

  if (dbError) {
    return apiError(ErrorCodes.INTERNAL, dbError.message);
  }

  return apiSuccess(data, 201);
}
