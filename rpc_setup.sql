-- Execute este código no SQL Editor do Supabase para corrigir o sistema de créditos.
-- Isso cria uma função segura que incrementa os créditos atomicamente.

create or replace function increment_usage(row_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  new_count int;
begin
  update public.profiles
  set usage_count = usage_count + 1
  where id = row_id
  returning usage_count into new_count;
  
  return new_count;
end;
$$;