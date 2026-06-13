-- Create a new private bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- Enable RLS on storage.objects if not already enabled
alter table storage.objects enable row level security;

-- Policy 1: Users can view their own avatar, or Admins can view all avatars
create policy "Avatar View Access"
  on storage.objects for select
  using (
    bucket_id = 'avatars' 
    and (auth.uid() = owner OR public.is_admin())
  );

-- Policy 2: Users can insert their own avatar
create policy "Avatar Insert Access"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.uid() = owner
  );

-- Policy 3: Users can update their own avatar
create policy "Avatar Update Access"
  on storage.objects for update
  using (
    bucket_id = 'avatars' 
    and auth.uid() = owner
  );

-- Policy 4: Users can delete their own avatar
create policy "Avatar Delete Access"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' 
    and auth.uid() = owner
  );
