-- Only AFTER the owner's wife has reviewed/corrected both Korean copies.
-- Review Vietnamese Partron content as well before publishing the bilingual card.
BEGIN;
UPDATE public.wedding_invitation_contents
SET review_status='approved',updated_at=now()
WHERE invitation_variant_id IN ('bride-partron','uncle-lee');
UPDATE public.wedding_invitation_variants
SET publication_status='published',updated_at=now()
WHERE id IN ('bride-partron','uncle-lee')
AND NOT EXISTS (
 SELECT 1 FROM unnest(supported_locales) AS supported(locale)
 LEFT JOIN public.wedding_invitation_contents c
 ON c.invitation_variant_id=wedding_invitation_variants.id AND c.locale=supported.locale
 WHERE c.review_status IS DISTINCT FROM 'approved'
);
COMMIT;
