-- New invitations use guest_code directly. Keep legacy hashes for already-sent links.
-- Remove only the original check requiring a hash before activating a guest.
-- Guest rows, RSVP, wishes, RLS and grants are unchanged.
DO $guest_code_links$
DECLARE old_check record;
BEGIN
  FOR old_check IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.wedding_guests'::regclass AND contype = 'c'
      AND regexp_replace(pg_get_constraintdef(oid), '[[:space:]()]', '', 'g')
        = 'CHECKNOTis_activeORinvite_token_hashISNOTNULL'
  LOOP
    EXECUTE format('ALTER TABLE public.wedding_guests DROP CONSTRAINT %I', old_check.conname);
  END LOOP;
END;
$guest_code_links$;

SELECT jsonb_build_object(
  'code_only_activation_ready', NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.wedding_guests'::regclass AND contype = 'c'
      AND regexp_replace(pg_get_constraintdef(oid), '[[:space:]()]', '', 'g')
        = 'CHECKNOTis_activeORinvite_token_hashISNOTNULL'
  ),
  'active_guests', (SELECT count(*) FROM public.wedding_guests WHERE is_active),
  'legacy_links_preserved', (SELECT count(*) FROM public.wedding_guests WHERE invite_token_hash IS NOT NULL)
) AS guest_code_links;
