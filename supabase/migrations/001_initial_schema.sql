-- Classes table
create table public.classes (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    code text unique not null,
    created_at timestamptz default now()
);

-- Profiles table (extends auth.users with role and class)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    display_name text,
    role text not null default 'student' check (role in ('student', 'ta', 'professor')),
    class_id uuid references public.classes(id),
    created_at timestamptz default now()
);

-- Activity logs table
create table public.activity_logs (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references auth.users(id) on delete cascade,
    event_type text not null,
    payload jsonb default '{}',
    created_at timestamptz default now()
);

-- Indexes
create index idx_activity_logs_student on public.activity_logs(student_id);
create index idx_activity_logs_created on public.activity_logs(created_at desc);
