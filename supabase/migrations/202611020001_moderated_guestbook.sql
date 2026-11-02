-- Apply before deploying the moderated guestbook. Existing wishes are preserved
-- and enter the review queue; nothing is automatically published or deleted.
BEGIN;
ALTER TABLE public.wedding_wishes
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.wedding_wishes'::regclass AND conname='wedding_wishes_moderation_status_check') THEN
    ALTER TABLE public.wedding_wishes ADD CONSTRAINT wedding_wishes_moderation_status_check
      CHECK (moderation_status IN ('pending','approved','rejected'));
  END IF;
END;
$block$;
CREATE INDEX IF NOT EXISTS wedding_wishes_moderation_created_id_idx
  ON public.wedding_wishes(moderation_status, created_at DESC, id DESC);
ALTER TABLE public.wedding_wishes ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.wedding_wishes FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.wedding_wishes TO service_role;
COMMIT;

SELECT jsonb_build_object(
  'moderation_column_ready', EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wedding_wishes' AND column_name='moderation_status' AND is_nullable='NO'),
  'server_can_review', has_table_privilege('service_role','public.wedding_wishes','UPDATE'),
  'public_access_blocked', NOT has_table_privilege('anon','public.wedding_wishes','SELECT') AND NOT has_table_privilege('authenticated','public.wedding_wishes','SELECT'),
  'pending_wishes', (SELECT count(*) FROM public.wedding_wishes WHERE moderation_status='pending')
) AS moderation;
