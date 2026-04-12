import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/contacts/export - vCard 내보내기
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids'); // 쉼표 구분 ID 목록 (없으면 전체)

  let query = supabase.from('contacts').select('*');

  if (ids) {
    query = query.in('id', ids.split(','));
  }

  const { data: contacts, error } = await query.order('last_name');

  if (error || !contacts) {
    return NextResponse.json({ error: 'export failed' }, { status: 500 });
  }

  // vCard 3.0 생성
  const vcards = contacts.map(c => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${c.last_name || ''};${c.first_name || ''};;;`,
      `FN:${[c.last_name, c.first_name].filter(Boolean).join(' ') || 'No Name'}`,
    ];

    if (c.phone) lines.push(`TEL;TYPE=CELL:${c.phone}`);
    if (c.phone2) lines.push(`TEL;TYPE=WORK:${c.phone2}`);
    if (c.email) lines.push(`EMAIL;TYPE=HOME:${c.email}`);
    if (c.email2) lines.push(`EMAIL;TYPE=WORK:${c.email2}`);
    if (c.company) lines.push(`ORG:${c.company}`);
    if (c.position) lines.push(`TITLE:${c.position}`);
    if (c.address) lines.push(`ADR;TYPE=HOME:;;${c.address};;;;`);
    if (c.memo) lines.push(`NOTE:${c.memo}`);

    lines.push('END:VCARD');
    return lines.join('\r\n');
  });

  const vcf = vcards.join('\r\n');

  return new NextResponse(vcf, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="contacts_${new Date().toISOString().slice(0, 10)}.vcf"`,
    },
  });
}
