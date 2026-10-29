-- READ ONLY: returns one JSON document, with metadata only (no guest records).
-- Copy/download the preflight result from Supabase SQL Editor for review.
SELECT jsonb_build_object(
 'columns', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM (
   SELECT table_name,column_name,data_type,is_nullable,column_default,is_identity,identity_generation
   FROM information_schema.columns WHERE table_schema='public'
   AND table_name IN ('wedding_rsvp','wedding_wishes') ORDER BY table_name,ordinal_position
 ) x),'[]'::jsonb),
 'rls', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM (
   SELECT c.relname AS table_name,c.relrowsecurity AS enabled,c.relforcerowsecurity AS forced
   FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relname IN ('wedding_rsvp','wedding_wishes')
 ) x),'[]'::jsonb),
 'policies', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM (
   SELECT tablename,policyname,permissive,roles,cmd,qual,with_check FROM pg_policies
   WHERE schemaname='public' AND tablename IN ('wedding_rsvp','wedding_wishes') ORDER BY tablename,policyname
 ) x),'[]'::jsonb),
 'grants', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM (
   SELECT table_name,grantee,privilege_type,is_grantable FROM information_schema.table_privileges
   WHERE table_schema='public' AND table_name IN ('wedding_rsvp','wedding_wishes') ORDER BY table_name,grantee,privilege_type
 ) x),'[]'::jsonb),
 'constraints', COALESCE((SELECT jsonb_agg(to_jsonb(x)) FROM (
   SELECT c.conrelid::regclass::text AS table_name,c.conname,pg_get_constraintdef(c.oid) AS definition
   FROM pg_constraint c WHERE c.conrelid IN (to_regclass('public.wedding_rsvp'),to_regclass('public.wedding_wishes'))
 ) x),'[]'::jsonb),
 'existing_new_tables', COALESCE((SELECT jsonb_agg(table_name) FROM information_schema.tables
   WHERE table_schema='public' AND table_name IN ('wedding_settings','wedding_events','wedding_invitation_variants','wedding_invitation_contents','wedding_guests')),'[]'::jsonb)
) AS preflight;
