-- Reviewed by the owner and translator, 2026-11-06.
-- Run AFTER Vercel has deployed the code supporting {days} in the countdown heading.
-- Only the 26 reviewed fields in the two Korean copies are updated.
-- Other fields, Vietnamese content, publication settings, events, guests, RSVP and wishes stay intact.
-- One atomic block, repeatable, without temporary tables or session state.
DO $reviewed_korean$
DECLARE
  patches jsonb := '[{"variant_id": "bride-partron", "edits": [{"path": ["labels", "saveTheDate"], "value": "Save The Date"}, {"path": ["labels", "galleryTitle"], "value": "우리의 아름다운 순간들"}, {"path": ["labels", "receptionInvitation"], "value": "결혼 피로연 청첩장"}, {"path": ["labels", "calendarTitle"], "value": "Save The Date"}, {"path": ["labels", "countdownEyebrow"], "value": "우리의 결혼식까지 {days}일 남았습니다"}, {"path": ["labels", "loadMore"], "value": "더 보기"}, {"path": ["salutation"], "value": "소중한 분들을 모십니다"}, {"path": ["defaultRecipient"], "value": "파트론 비나 임직원 여러분께"}, {"path": ["footerThanks"], "value": "평생을 같이하고 싶은 사람을 만났습니다.\n\n서로 아껴주고 이해하며 사랑을 베풀며 살고 싶습니다.\n\n따뜻한 마음으로 저희의 하나 됨을 지켜보아 주시고 격려해 주신다면 \n\n큰 힘이 되겠습니다."}, {"path": ["eventTitle"], "value": "결혼 피로연"}, {"path": ["labels", "submitAnother"], "value": "다른 회신하기"}, {"path": ["labels", "loadingWishes"], "value": "축하 메시지 로딩 중…"}, {"path": ["rsvpThanks"], "value": "회신해주셔서 감사드립니다."}, {"path": ["labels", "weddingInvitation"], "value": "결혼 피로연 청첩장"}]}, {"variant_id": "uncle-lee", "edits": [{"path": ["labels", "saveTheDate"], "value": "Save The Date"}, {"path": ["labels", "galleryTitle"], "value": "우리의 아름다운 순간들"}, {"path": ["labels", "weddingInvitation"], "value": "청첩장"}, {"path": ["labels", "calendarTitle"], "value": "Save The Date"}, {"path": ["labels", "countdownEyebrow"], "value": "우리의 결혼식까지 {days}일 남았습니다"}, {"path": ["labels", "loadMore"], "value": "더 보기"}, {"path": ["salutation"], "value": "우리의 결혼식에 참석해주시면 감사하겠습니다"}, {"path": ["defaultRecipient"], "value": "이준석 선생님께"}, {"path": ["footerThanks"], "value": "평생을 같이하고 싶은 사람을 만났습니다.\n\n서로 아껴주고 이해하며 사랑을 베풀며 살고 싶습니다.\n\n따뜻한 마음으로 저희의 하나 됨을 지켜보아 주시고 격려해 주신다면 \n\n큰 힘이 되겠습니다."}, {"path": ["labels", "submitAnother"], "value": "다른 회신하기"}, {"path": ["labels", "loadingWishes"], "value": "축하 메시지 로딩 중…"}, {"path": ["rsvpThanks"], "value": "회신해주셔서 감사드립니다."}]}]'::jsonb;
  item jsonb;
  edit jsonb;
  next_content jsonb;
  field_path text[];
BEGIN
  IF (SELECT count(*) FROM public.wedding_invitation_contents
      WHERE invitation_variant_id IN ('bride-partron','uncle-lee') AND locale='ko') <> 2
  THEN RAISE EXCEPTION 'Both Korean copies must exist; no content was changed'; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(patches)
  LOOP
    SELECT content INTO next_content FROM public.wedding_invitation_contents
      WHERE invitation_variant_id=item->>'variant_id' AND locale='ko' FOR UPDATE;
    IF jsonb_typeof(next_content) IS DISTINCT FROM 'object'
      OR jsonb_typeof(next_content->'labels') IS DISTINCT FROM 'object'
    THEN RAISE EXCEPTION 'Invalid content structure; no content was changed'; END IF;
    FOR edit IN SELECT value FROM jsonb_array_elements(item->'edits')
    LOOP
      SELECT array_agg(value ORDER BY ordinal) INTO field_path
        FROM jsonb_array_elements_text(edit->'path') WITH ORDINALITY AS fields(value,ordinal);
      IF jsonb_typeof(next_content #> field_path) IS DISTINCT FROM 'string'
      THEN RAISE EXCEPTION 'A reviewed field is missing or invalid; no content was changed'; END IF;
      next_content := jsonb_set(next_content,field_path,edit->'value',false);
    END LOOP;
    UPDATE public.wedding_invitation_contents
      SET content=next_content,review_status='approved',updated_at=now()
      WHERE invitation_variant_id=item->>'variant_id' AND locale='ko';
  END LOOP;
END;
$reviewed_korean$;

WITH patches AS (SELECT value AS item FROM jsonb_array_elements('[{"variant_id": "bride-partron", "edits": [{"path": ["labels", "saveTheDate"], "value": "Save The Date"}, {"path": ["labels", "galleryTitle"], "value": "우리의 아름다운 순간들"}, {"path": ["labels", "receptionInvitation"], "value": "결혼 피로연 청첩장"}, {"path": ["labels", "calendarTitle"], "value": "Save The Date"}, {"path": ["labels", "countdownEyebrow"], "value": "우리의 결혼식까지 {days}일 남았습니다"}, {"path": ["labels", "loadMore"], "value": "더 보기"}, {"path": ["salutation"], "value": "소중한 분들을 모십니다"}, {"path": ["defaultRecipient"], "value": "파트론 비나 임직원 여러분께"}, {"path": ["footerThanks"], "value": "평생을 같이하고 싶은 사람을 만났습니다.\n\n서로 아껴주고 이해하며 사랑을 베풀며 살고 싶습니다.\n\n따뜻한 마음으로 저희의 하나 됨을 지켜보아 주시고 격려해 주신다면 \n\n큰 힘이 되겠습니다."}, {"path": ["eventTitle"], "value": "결혼 피로연"}, {"path": ["labels", "submitAnother"], "value": "다른 회신하기"}, {"path": ["labels", "loadingWishes"], "value": "축하 메시지 로딩 중…"}, {"path": ["rsvpThanks"], "value": "회신해주셔서 감사드립니다."}, {"path": ["labels", "weddingInvitation"], "value": "결혼 피로연 청첩장"}]}, {"variant_id": "uncle-lee", "edits": [{"path": ["labels", "saveTheDate"], "value": "Save The Date"}, {"path": ["labels", "galleryTitle"], "value": "우리의 아름다운 순간들"}, {"path": ["labels", "weddingInvitation"], "value": "청첩장"}, {"path": ["labels", "calendarTitle"], "value": "Save The Date"}, {"path": ["labels", "countdownEyebrow"], "value": "우리의 결혼식까지 {days}일 남았습니다"}, {"path": ["labels", "loadMore"], "value": "더 보기"}, {"path": ["salutation"], "value": "우리의 결혼식에 참석해주시면 감사하겠습니다"}, {"path": ["defaultRecipient"], "value": "이준석 선생님께"}, {"path": ["footerThanks"], "value": "평생을 같이하고 싶은 사람을 만났습니다.\n\n서로 아껴주고 이해하며 사랑을 베풀며 살고 싶습니다.\n\n따뜻한 마음으로 저희의 하나 됨을 지켜보아 주시고 격려해 주신다면 \n\n큰 힘이 되겠습니다."}, {"path": ["labels", "submitAnother"], "value": "다른 회신하기"}, {"path": ["labels", "loadingWishes"], "value": "축하 메시지 로딩 중…"}, {"path": ["rsvpThanks"], "value": "회신해주셔서 감사드립니다."}]}]'::jsonb)),
expected AS (
  SELECT item->>'variant_id' AS variant_id,edit,
    ARRAY(SELECT jsonb_array_elements_text(edit->'path')) AS field_path
  FROM patches CROSS JOIN LATERAL jsonb_array_elements(item->'edits') AS edits(edit)
), checked AS (
  SELECT e.*,(c.content #> e.field_path)=e.edit->'value' AS matches
  FROM expected e JOIN public.wedding_invitation_contents c
    ON c.invitation_variant_id=e.variant_id AND c.locale='ko'
)
SELECT jsonb_build_object(
  'updated_invitations',(SELECT count(*) FROM public.wedding_invitation_contents
    WHERE invitation_variant_id IN ('bride-partron','uncle-lee') AND locale='ko' AND review_status='approved'),
  'reviewed_fields',(SELECT count(*) FROM checked),
  'all_reviewed_fields_match',(SELECT bool_and(matches) FROM checked),
  'by_invitation',(SELECT jsonb_object_agg(variant_id,n) FROM
    (SELECT variant_id,count(*) AS n FROM checked WHERE matches GROUP BY variant_id) grouped)
) AS korean_review_update;
