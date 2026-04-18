-- ============================================
-- contica - Supabase 스키마
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. contacts 테이블
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'default',
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  phone2 text default '',
  email text default '',
  email2 text default '',
  company text default '',
  position text default '',
  address text default '',
  memo text default '',
  profile_image text default '',
  favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. groups 테이블
create table if not exists groups (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'default',
  name text not null,
  color text default '#6366f1',
  created_at timestamptz default now()
);

-- 3. contact_groups 연결 테이블
create table if not exists contact_groups (
  contact_id uuid references contacts(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  primary key (contact_id, group_id)
);

-- 4. sync_log 동기화 로그
create table if not exists sync_log (
  id uuid default gen_random_uuid() primary key,
  user_id text not null default 'default',
  action text not null, -- 'create', 'update', 'delete'
  contact_id uuid,
  device_id text,
  synced_at timestamptz default now()
);

-- 인덱스
create index if not exists idx_contacts_user on contacts(user_id);
create index if not exists idx_contacts_name on contacts(last_name, first_name);
create index if not exists idx_contacts_phone on contacts(phone);
create index if not exists idx_contacts_favorite on contacts(user_id, favorite);
create index if not exists idx_groups_user on groups(user_id);
create index if not exists idx_sync_log_user on sync_log(user_id, synced_at);

-- updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists contacts_updated_at on contacts;
create trigger contacts_updated_at
  before update on contacts
  for each row execute function update_updated_at();

-- RLS (Row Level Security) - 기본 비활성화 (개인용)
-- 멀티유저가 필요하면 아래 주석 해제
-- alter table contacts enable row level security;
-- alter table groups enable row level security;

-- Realtime 활성화
alter publication supabase_realtime add table contacts;
alter publication supabase_realtime add table groups;
alter publication supabase_realtime add table contact_groups;
