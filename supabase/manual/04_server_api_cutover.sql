-- DRAFT ONLY. Never run before the new server-rendered pages and server APIs work.
-- The current application writes directly with the browser's public Supabase client.
-- Running this early disables those old forms. Keep the preflight grants/policies output.
-- Owner authorization, server-only credentials, end-to-end tests and rollout review
-- are prerequisites. This file does not deploy application code or publish variants.
BEGIN;

ALTER TABLE public.wedding_rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_wishes ENABLE ROW LEVEL SECURITY;

-- Privilege revocation also closes access left by old permissive policies.
-- Existing policies are retained for inspection; new restrictive policies alone
-- would not cancel existing permissive policies.
REVOKE ALL PRIVILEGES ON TABLE public.wedding_rsvp, public.wedding_wishes
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.wedding_rsvp TO service_role;
GRANT SELECT, INSERT ON public.wedding_wishes TO service_role;

-- Grant only the actual ID sequences, if these tables use an identity/serial default.
DO $block$
DECLARE
  table_name text;
  sequence_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['wedding_rsvp', 'wedding_wishes'] LOOP
    sequence_name := pg_get_serial_sequence('public.' || table_name, 'id');
    IF sequence_name IS NOT NULL THEN
      EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE %s FROM PUBLIC, anon, authenticated', sequence_name);
      EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO service_role', sequence_name);
    END IF;
  END LOOP;
END;
$block$;

COMMIT;
