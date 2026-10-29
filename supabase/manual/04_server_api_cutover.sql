-- Run only after the new application/server API works with the live database.
-- Preserves all records and existing policies; closes the legacy public table API.
-- Save the FIRST result, including restore_sql, for an exact grant rollback.
BEGIN;

DROP TABLE IF EXISTS pg_temp.wedding_cutover_restore;
CREATE TEMP TABLE wedding_cutover_restore(restore_sql text) ON COMMIT PRESERVE ROWS;

-- Snapshot the affected table, sequence and explicit column grants before revocation.
WITH objects AS (
  SELECT c.oid,c.relkind,c.relowner,c.relacl,
         format('%I.%I',n.nspname,c.relname) AS qualified_name
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE c.oid IN (
    'public.wedding_rsvp'::regclass,'public.wedding_wishes'::regclass,
    to_regclass(pg_get_serial_sequence('public.wedding_rsvp','id')),
    to_regclass(pg_get_serial_sequence('public.wedding_wishes','id'))
  )
), statements AS (
  SELECT format('GRANT %s ON %s %s TO %s%s;',a.privilege_type,
    CASE WHEN o.relkind='S' THEN 'SEQUENCE' ELSE 'TABLE' END,o.qualified_name,
    CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE format('%I',pg_get_userbyid(a.grantee)) END,
    CASE WHEN a.is_grantable THEN ' WITH GRANT OPTION' ELSE '' END) AS statement
  FROM objects o CROSS JOIN LATERAL aclexplode(COALESCE(o.relacl,
    acldefault(CASE WHEN o.relkind='S' THEN 'S'::"char" ELSE 'r'::"char" END,o.relowner))) a
  WHERE a.grantee=0 OR pg_get_userbyid(a.grantee) IN ('anon','authenticated')
  UNION ALL
  SELECT format('GRANT %s (%I) ON TABLE %s TO %s%s;',a.privilege_type,p.attname,o.qualified_name,
    CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE format('%I',pg_get_userbyid(a.grantee)) END,
    CASE WHEN a.is_grantable THEN ' WITH GRANT OPTION' ELSE '' END)
  FROM objects o JOIN pg_attribute p ON p.attrelid=o.oid AND p.attnum>0 AND NOT p.attisdropped
  CROSS JOIN LATERAL aclexplode(p.attacl) a
  WHERE o.relkind<>'S' AND (a.grantee=0 OR pg_get_userbyid(a.grantee) IN ('anon','authenticated'))
)
INSERT INTO wedding_cutover_restore
SELECT 'BEGIN;' || E'\n' || COALESCE(string_agg(statement,E'\n' ORDER BY statement),'') || E'\nCOMMIT;'
FROM statements;

ALTER TABLE public.wedding_rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_wishes ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.wedding_rsvp, public.wedding_wishes
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.wedding_rsvp TO service_role;
GRANT SELECT, INSERT ON public.wedding_wishes TO service_role;

DO $block$
DECLARE
  table_name text;
  sequence_name text;
  column_names text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['wedding_rsvp','wedding_wishes'] LOOP
    -- Table-level REVOKE alone does not remove separate column grants.
    SELECT string_agg(format('%I',attname),', ' ORDER BY attnum) INTO column_names
    FROM pg_attribute WHERE attrelid=to_regclass('public.' || table_name)
      AND attnum>0 AND NOT attisdropped AND attacl IS NOT NULL;
    IF column_names IS NOT NULL THEN
      EXECUTE format('REVOKE SELECT (%1$s), INSERT (%1$s), UPDATE (%1$s), REFERENCES (%1$s) ON TABLE public.%2$I FROM PUBLIC, anon, authenticated',column_names,table_name);
    END IF;
    sequence_name := pg_get_serial_sequence('public.' || table_name,'id');
    IF sequence_name IS NOT NULL THEN
      EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE %s FROM PUBLIC, anon, authenticated',sequence_name);
      EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO service_role',sequence_name);
    END IF;
  END LOOP;
END;
$block$;
COMMIT;

SELECT jsonb_build_object(
 'rls_enabled',(SELECT bool_and(relrowsecurity) FROM pg_class WHERE oid IN ('public.wedding_rsvp'::regclass,'public.wedding_wishes'::regclass)),
 'public_table_access_blocked',(
   SELECT bool_and(NOT has_table_privilege(role_name,table_name,privilege))
   FROM unnest(ARRAY['anon','authenticated']) role_name
   CROSS JOIN unnest(ARRAY['public.wedding_rsvp','public.wedding_wishes']) table_name
   CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) privilege
 ),
 'public_column_access_blocked',(
   SELECT bool_and(NOT has_any_column_privilege(role_name,table_name,privilege))
   FROM unnest(ARRAY['anon','authenticated']) role_name
   CROSS JOIN unnest(ARRAY['public.wedding_rsvp','public.wedding_wishes']) table_name
   CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','REFERENCES']) privilege
 ),
 'server_rsvp_ready',has_table_privilege('service_role','public.wedding_rsvp','SELECT')
    AND has_table_privilege('service_role','public.wedding_rsvp','INSERT')
    AND has_table_privilege('service_role','public.wedding_rsvp','UPDATE'),
 'server_wishes_ready',has_table_privilege('service_role','public.wedding_wishes','SELECT')
    AND has_table_privilege('service_role','public.wedding_wishes','INSERT'),
 'server_id_sequences_ready',(
   SELECT bool_and(CASE WHEN sequence_name IS NULL THEN false ELSE has_sequence_privilege('service_role',sequence_name,'USAGE') END)
   FROM (SELECT pg_get_serial_sequence('public.' || table_name,'id') AS sequence_name
         FROM unnest(ARRAY['wedding_rsvp','wedding_wishes']) table_name) sequences
 ),
 'restore_sql',(SELECT restore_sql FROM pg_temp.wedding_cutover_restore)
) AS cutover;
