import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/contacts/[id] - 연락처 상세
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('contacts')
    .select('*, contact_groups(group_id, groups(*))')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PUT /api/contacts/[id] - 연락처 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { groups: groupIds, contact_groups, ...contactData } = body;

  const { data, error } = await supabase
    .from('contacts')
    .update(contactData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 그룹 재설정
  if (groupIds !== undefined) {
    await supabase.from('contact_groups').delete().eq('contact_id', id);
    if (groupIds.length > 0) {
      await supabase.from('contact_groups').insert(
        groupIds.map((gid: string) => ({ contact_id: id, group_id: gid }))
      );
    }
  }

  // 동기화 로그
  await supabase.from('sync_log').insert({
    action: 'update',
    contact_id: id,
    device_id: body.device_id || 'web',
  });

  return NextResponse.json(data);
}

// DELETE /api/contacts/[id] - 연락처 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 동기화 로그 먼저
  await supabase.from('sync_log').insert({
    action: 'delete',
    contact_id: id,
    device_id: 'web',
  });

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
