-- Create Sessions Table
create table sessions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- simplified from uuid if using custom ids
  date date not null,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  total_duration_seconds int default 0,
  success_rate float default 0
);

-- Create Events Table
create table events (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) not null,
  level_number int not null,
  target_letter char(1) not null,
  distractors text[] not null,
  chosen_item char(1) not null,
  is_correct boolean not null,
  reaction_time_ms int,
  timestamp timestamp with time zone default now()
);

-- Index for querying by user and date
create index idx_sessions_user_date on sessions(user_id, date);
create index idx_events_session on events(session_id);
