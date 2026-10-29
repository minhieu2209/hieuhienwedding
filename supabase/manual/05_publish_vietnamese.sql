-- Run only after the owner has reviewed these Vietnamese invitation contents.
-- Does not approve or publish the Korean drafts.
BEGIN;
UPDATE public.wedding_invitation_contents
SET review_status='approved',updated_at=now()
WHERE locale='vi' AND invitation_variant_id IN
 ('groom-ngv','groom-friends','groom-ufc97','bride-friends','bride-friends1');
UPDATE public.wedding_invitation_variants
SET publication_status='published',updated_at=now()
WHERE id IN ('groom-ngv','groom-friends','groom-ufc97','bride-friends','bride-friends1')
AND NOT EXISTS (
 SELECT 1 FROM unnest(supported_locales) AS supported(locale)
 LEFT JOIN public.wedding_invitation_contents c
 ON c.invitation_variant_id=wedding_invitation_variants.id AND c.locale=supported.locale
 WHERE c.review_status IS DISTINCT FROM 'approved'
);
COMMIT;
