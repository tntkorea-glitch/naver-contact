import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/groups - 그룹 목록
export async function GET() {
  const { data: groups, error } = await supabase
    .from('groups')
    .select('*')
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 각 그룹별 연락처 수 계산
  const { data: counts } = await supabase
    .from('contact_groups')
    .select('group_id');

  const countMap: Record<string, number> = {};
  counts?.forEach(c => {
    countMap[c.group_id] = (countMap[c.group_id] || 0) + 1;
  });

  const result = groups?.map(g => ({
    ...g,
    contact_count: countMap[g.id] || 0,
  }));

  return NextResponse.json(result || []);
}

// POST /api/groups - 그룹 생성
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('groups')
    .insert({ name: body.name, color: body.color || '#6366f1' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PUT /api/groups - 그룹 수정 (id in body)
export async function PUT(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('groups')
    .update({ name: body.name, color: body.color })
    .eq('id', body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/groups
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const { error } = await supabase.from('groups').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
