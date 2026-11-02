-- Run when the owner authorizes publishing the current Partron and UncleLEE copies.
-- Translations remain editable afterward; existing guest links are untouched.
BEGIN;
DO $block$
BEGIN
  IF (SELECT count(*) FROM public.wedding_invitation_variants
      WHERE id IN ('bride-partron','uncle-lee') AND 'ko'=ANY(supported_locales)) <> 2 THEN
    RAISE EXCEPTION 'Both Korean invitation variants must exist and support ko';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.wedding_invitation_variants v
    CROSS JOIN LATERAL unnest(v.supported_locales) AS supported(locale)
    LEFT JOIN public.wedding_invitation_contents c
      ON c.invitation_variant_id=v.id AND c.locale=supported.locale
    WHERE v.id IN ('bride-partron','uncle-lee')
      AND (c.invitation_variant_id IS NULL OR jsonb_typeof(c.content) IS DISTINCT FROM 'object')
  ) THEN
    RAISE EXCEPTION 'A required translation is missing; no invitation has been published';
  END IF;
END;
$block$;
UPDATE public.wedding_invitation_contents c
SET review_status='approved',updated_at=now()
FROM public.wedding_invitation_variants v
WHERE v.id IN ('bride-partron','uncle-lee')
  AND c.invitation_variant_id=v.id AND c.locale=ANY(v.supported_locales);
UPDATE public.wedding_invitation_variants
SET publication_status='published',updated_at=now()
WHERE id IN ('bride-partron','uncle-lee');
COMMIT;

SELECT jsonb_build_object(
  'published',(SELECT count(*) FROM public.wedding_invitation_variants WHERE id IN ('bride-partron','uncle-lee') AND publication_status='published'),
  'approved_translations',(
    SELECT count(*) FROM public.wedding_invitation_contents c
    JOIN public.wedding_invitation_variants v ON v.id=c.invitation_variant_id
    WHERE v.id IN ('bride-partron','uncle-lee') AND c.locale=ANY(v.supported_locales) AND c.review_status='approved'
  ),
  'invitations',(
    SELECT jsonb_agg(jsonb_build_object('id',id,'path',path,'default_locale',default_locale,'supported_locales',supported_locales,'status',publication_status) ORDER BY id)
    FROM public.wedding_invitation_variants WHERE id IN ('bride-partron','uncle-lee')
  )
) AS korean_activation;
