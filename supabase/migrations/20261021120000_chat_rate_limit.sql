-- Per-user limit for /api/chat: at most 30 Claude requests in any rolling hour.
-- api/chat.js calls chat_rate_hit() with the user's own access token before every Claude call.
-- The table has RLS on and no policies: nobody can read or change it directly, only through the function.

create table if not exists public.chat_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists chat_requests_user_time_idx
  on public.chat_requests (user_id, created_at desc);

alter table public.chat_requests enable row level security;
revoke all on table public.chat_requests from anon, authenticated;

-- Records one request for the signed-in user if they are under the limit.
-- Returns {allowed, limit, remaining, retry_after} where retry_after is in seconds.
create or replace function public.chat_rate_hit()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  max_requests constant int := 30;
  win constant interval := interval '1 hour';
  used int;
  oldest timestamptz;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- Serialise parallel requests of the same user so they cannot all slip under the limit.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));

  delete from public.chat_requests where user_id = uid and created_at < now() - win;
  select count(*), min(created_at) into used, oldest
    from public.chat_requests where user_id = uid;

  if used >= max_requests then
    return json_build_object(
      'allowed', false,
      'limit', max_requests,
      'remaining', 0,
      'retry_after', greatest(1, ceil(extract(epoch from (oldest + win - now()))))::int
    );
  end if;

  insert into public.chat_requests (user_id) values (uid);
  return json_build_object(
    'allowed', true,
    'limit', max_requests,
    'remaining', max_requests - used - 1,
    'retry_after', 0
  );
end;
$$;

revoke all on function public.chat_rate_hit() from public, anon;
grant execute on function public.chat_rate_hit() to authenticated;
