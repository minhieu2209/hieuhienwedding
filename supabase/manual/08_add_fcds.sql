-- Run once in Supabase SQL Editor to publish the FCDS group invitation.
-- Safe to run again: it refreshes only the FCDS variant and its Vietnamese copy.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.wedding_invitation_variants v
    JOIN public.wedding_invitation_contents c ON c.invitation_variant_id = v.id
    WHERE v.id = 'groom-ufc97' AND v.path = '/groom/UFC97'
      AND v.host_side = 'groom' AND v.event_id = 'groom-wedding'
      AND v.publication_status = 'published'
      AND c.locale = 'vi' AND c.review_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Published Vietnamese UFC97 invitation is required before creating FCDS';
  END IF;
END $$;

INSERT INTO public.wedding_invitation_variants
  (id, path, host_side, first_person, event_id, recipient_mode,
   default_locale, supported_locales, publication_status)
VALUES
  ('groom-fcds', '/groom/FCDS', 'groom', 'groom', 'groom-wedding', 'group',
   'vi', ARRAY['vi']::text[], 'published')
ON CONFLICT (id) DO UPDATE SET
  path = EXCLUDED.path,
  host_side = EXCLUDED.host_side,
  first_person = EXCLUDED.first_person,
  event_id = EXCLUDED.event_id,
  recipient_mode = EXCLUDED.recipient_mode,
  default_locale = EXCLUDED.default_locale,
  supported_locales = EXCLUDED.supported_locales,
  publication_status = EXCLUDED.publication_status,
  updated_at = now();

INSERT INTO public.wedding_invitation_contents
  (invitation_variant_id, locale, content, review_status)
SELECT 'groom-fcds', 'vi',
  jsonb_set(
    jsonb_set(c.content, '{defaultRecipient}', to_jsonb('Toàn thể Anh/Em FC Dưỡng Sinh'::text)),
    '{invitation}',
    to_jsonb('Chúng em trân trọng kính mời Toàn thể Anh/Em FC Dưỡng Sinh đến chung vui trong lễ thành hôn của Minh Hiếu và Thu Hiền. Sự hiện diện của Anh/Em là niềm vui và vinh hạnh của chúng em.'::text)
  ),
  'approved'
FROM public.wedding_invitation_contents c
WHERE c.invitation_variant_id = 'groom-ufc97' AND c.locale = 'vi'
ON CONFLICT (invitation_variant_id, locale) DO UPDATE SET
  content = EXCLUDED.content,
  review_status = EXCLUDED.review_status,
  updated_at = now();

COMMIT;

SELECT v.path, v.publication_status, c.content->>'defaultRecipient' AS recipient,
       c.review_status
FROM public.wedding_invitation_variants v
JOIN public.wedding_invitation_contents c ON c.invitation_variant_id = v.id
WHERE v.id = 'groom-fcds' AND c.locale = 'vi';
