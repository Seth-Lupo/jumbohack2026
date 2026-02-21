-- Test table: foo with editable bar field, associated with a user
create table public.foo (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    bar text not null default '',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
