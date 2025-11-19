-- ============================================================================
-- Auth Hook: Duplicate Email Detection
-- ============================================================================
-- Deze functie wordt aangeroepen VOOR een nieuwe user wordt aangemaakt.
-- Checkt of het emailadres al bestaat en blokkeert signup indien nodig.
--
-- Hook Type: before-user-created
-- Flexibel: Werkt met elke auth provider die Postgres functies ondersteunt
-- ============================================================================

create or replace function public.hook_check_duplicate_email(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  user_email text;
  email_exists boolean;
begin
  -- Extract email from event payload
  user_email := event->'user'->>'email';

  -- Validate email is not null or empty
  if user_email is null or trim(user_email) = '' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'Email adres is verplicht.',
        'http_code', 400
      )
    );
  end if;

  -- Normalize email (lowercase, trim) for consistent checking
  user_email := lower(trim(user_email));

  -- Check if email already exists in auth.users (case-insensitive)
  select exists(
    select 1
    from auth.users
    where lower(email) = user_email
  ) into email_exists;

  -- If email exists, reject signup with error
  if email_exists then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'Dit emailadres is al geregistreerd. Probeer in te loggen of gebruik "Wachtwoord vergeten?".',
        'http_code', 400
      )
    );
  end if;

  -- Email doesn't exist, allow signup
  return '{}'::jsonb;
end;
$$;

-- Grant execute permission to Supabase Auth service
grant execute
  on function public.hook_check_duplicate_email
  to supabase_auth_admin;

-- Revoke from other roles (security)
revoke execute
  on function public.hook_check_duplicate_email
  from authenticated, anon, public;

-- Add comment for documentation
comment on function public.hook_check_duplicate_email is
  'Auth hook voor duplicate email detection. Wordt aangeroepen via Supabase Auth Hooks (before-user-created).';
