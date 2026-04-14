import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);

// Supabase는 단일 요청당 최대 1000행만 반환 (db.max-rows 기본값).
// 페이지네이션으로 모든 행을 가져오는 헬퍼.
type SupaQueryBuilder<T> = {
  range: (from: number, to: number) => Promise<{ data: T[] | null; error: unknown }>;
};

export async function fetchAllRows<T>(
  build: () => SupaQueryBuilder<T>,
  pageSize = 1000,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build().range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < pageSize) break;
  }
  return out;
}

// 타입 정의
export interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  phone2?: string;
  email?: string;
  email2?: string;
  company?: string;
  position?: string;
  address?: string;
  memo?: string;
  profile_image?: string;
  favorite: boolean;
  version: number;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  groups?: Group[];
  contact_groups?: { group_id: string }[];
}

export interface Group {
  id: string;
  user_id: string;
  name: string;
  color: string;
  version: number;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  contact_count?: number;
}

export interface ContactGroup {
  contact_id: string;
  group_id: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete';
  contact_id: string;
  device_id: string;
  synced_at: string;
}
