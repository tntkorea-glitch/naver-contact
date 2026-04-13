import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/api-auth';
import { apiError, apiPaginated, apiSuccess, ErrorCodes } from '@/lib/errors';

// GET /api/v1/contacts — 연락처 목록 (페이지네이션, 필터, 정렬)
export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  const sp = request.nextUrl.searchParams;
  const page = parseInt(sp.get('page') || '1');
  const limit = Math.min(parseInt(sp.get('limit') || '30'), 100);
  const sort = sp.get('sort') || 'last_name';
  const direction = (sp.get('direction') || 'asc') as 'asc' | 'desc';
  const search = sp.get('search') || '';
  const groupId = sp.get('group_id') || '';
  const favoriteOnly = sp.get('favorite') === 'true';
  const trashOnly = sp.get('trash') === 'true';
  const noNameOnly = sp.get('no_name') === 'true';
  const offset = (page - 1) * limit;

  let query = supabase
    .from('contacts')
    .select('*, contact_groups(group_id)', { count: 'exact' })
    .eq('user_id', user!.id);

  // 휴지통 vs 일반
  if (trashOnly) {
    query = query.not('deleted_at', 'is', null);
  } else {
    query = query.is('deleted_at', null);
  }

  // 이름없는 연락처
  if (noNameOnly) {
    query = query.eq('first_name', '').eq('last_name', '');
  }

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    );
  }

  if (favoriteOnly) {
    query = query.eq('favorite', true);
  }

  if (groupId) {
    const { data: cg } = await supabase
      .from('contact_groups')
      .select('contact_id')
      .eq('group_id', groupId)
      .is('removed_at', null);

    if (cg && cg.length > 0) {
      query = query.in('id', cg.map(c => c.contact_id));
    } else {
      return apiPaginated([], 0, page, limit);
    }
  }

  const { data, error: dbError, count } = await query
    .order(sort, { ascending: direction === 'asc' })
    .range(offset, offset + limit - 1);

  if (dbError) {
    return apiError(ErrorCodes.INTERNAL, dbError.message);
  }

  return apiPaginated(data || [], count || 0, page, limit);
}

// POST /api/v1/contacts — 연락처 생성
export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  const body = await request.json();
  const { groups: groupIds, ...contactData } = body;

  const { data, error: dbError } = await supabase
    .from('contacts')
    .insert({ ...contactData, user_id: user!.id })
    .select()
    .single();

  if (dbError) {
    return apiError(ErrorCodes.INTERNAL, dbError.message);
  }

  // 그룹 연결
  if (groupIds?.length && data) {
    await supabase.from('contact_groups').insert(
      groupIds.map((gid: string) => ({ contact_id: data.id, group_id: gid }))
    );
  }

  // 동기화 이벤트
  await supabase.from('sync_events').insert({
    user_id: user!.id,
    entity_type: 'contact',
    entity_id: data.id,
    action: 'create',
  });

  return apiSuccess(data, 201);
}
