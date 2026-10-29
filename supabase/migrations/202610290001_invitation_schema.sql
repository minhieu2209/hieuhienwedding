-- DRAFT ONLY. Not executed on Supabase.
-- One-time migration; run after reviewing 00_preflight_read_only.sql.
-- No existing rows are deleted or classified. Existing API policies/grants stay unchanged.
-- New tables are server/admin-only. This phase does NOT secure the legacy direct APIs.
-- Re-running after success intentionally fails instead of silently accepting schema drift.
BEGIN;

CREATE TABLE public.wedding_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  couple jsonb NOT NULL CHECK (jsonb_typeof(couple) = 'object'),
  media jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(media) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.wedding_events (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9-]+$'),
  event_kind text NOT NULL CHECK (event_kind IN ('wedding', 'reception')),
  starts_at timestamptz NOT NULL,
  doors_open_at timestamptz,
  time_zone text NOT NULL DEFAULT 'Asia/Ho_Chi_Minh'
    CHECK (time_zone = 'Asia/Ho_Chi_Minh'),
  venue text NOT NULL CHECK (length(trim(venue)) > 0),
  address text NOT NULL CHECK (length(trim(address)) > 0),
  map_url text NOT NULL CHECK (map_url LIKE 'https://%'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.wedding_invitation_variants (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9-]+$'),
  path text NOT NULL UNIQUE CHECK (path ~ '^/[A-Za-z0-9]+(/[A-Za-z0-9]+)*$'),
  host_side text NOT NULL CHECK (host_side IN ('groom', 'bride')),
  first_person text NOT NULL CHECK (first_person IN ('groom', 'bride')),
  event_id text NOT NULL REFERENCES public.wedding_events(id),
  recipient_mode text NOT NULL CHECK (recipient_mode IN ('group', 'individual', 'fixed')),
  default_locale text NOT NULL CHECK (default_locale IN ('vi', 'ko')),
  supported_locales text[] NOT NULL,
  publication_status text NOT NULL DEFAULT 'draft'
    CHECK (publication_status IN ('draft', 'published', 'paused')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (cardinality(supported_locales) BETWEEN 1 AND 2),
  CHECK (array_position(supported_locales, NULL) IS NULL),
  CHECK (supported_locales <@ ARRAY['vi','ko']::text[]),
  CHECK (default_locale = ANY(supported_locales)),
  UNIQUE (id, event_id, host_side)
);

CREATE TABLE public.wedding_invitation_contents (
  invitation_variant_id text NOT NULL REFERENCES public.wedding_invitation_variants(id),
  locale text NOT NULL CHECK (locale IN ('vi', 'ko')),
  content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object'),
  review_status text NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft', 'approved')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (invitation_variant_id, locale)
);

CREATE TABLE public.wedding_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_code text NOT NULL UNIQUE CHECK (length(trim(guest_code)) BETWEEN 1 AND 80),
  invitation_variant_id text NOT NULL REFERENCES public.wedding_invitation_variants(id),
  display_name text NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 120),
  invite_token_hash text UNIQUE CHECK (invite_token_hash ~ '^[0-9a-f]{64}$'),
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT is_active OR invite_token_hash IS NOT NULL),
  UNIQUE (id, invitation_variant_id)
);

ALTER TABLE public.wedding_rsvp
  ADD COLUMN invitation_variant_id text,
  ADD COLUMN event_id text,
  ADD COLUMN host_side text CHECK (host_side IN ('groom','bride')),
  ADD COLUMN guest_id uuid,
  ADD COLUMN submission_id uuid,
  ADD CONSTRAINT wedding_rsvp_variant_event_side_fk
    FOREIGN KEY (invitation_variant_id, event_id, host_side)
    REFERENCES public.wedding_invitation_variants(id, event_id, host_side),
  ADD CONSTRAINT wedding_rsvp_guest_variant_fk
    FOREIGN KEY (guest_id, invitation_variant_id)
    REFERENCES public.wedding_guests(id, invitation_variant_id),
  ADD CONSTRAINT wedding_rsvp_new_submission_check CHECK (
    invitation_variant_id IS NULL OR (
      event_id IS NOT NULL AND host_side IS NOT NULL AND submission_id IS NOT NULL
      AND guest_name IS NOT NULL AND length(trim(guest_name)) BETWEEN 1 AND 120
      AND attendance IS NOT NULL AND attendance IN ('yes','no')
      AND guest_count IS NOT NULL
      AND ((attendance = 'yes' AND guest_count BETWEEN 1 AND 5)
        OR (attendance = 'no' AND guest_count = 0))
    )
  );

ALTER TABLE public.wedding_wishes
  ADD COLUMN invitation_variant_id text,
  ADD COLUMN event_id text,
  ADD COLUMN host_side text CHECK (host_side IN ('groom','bride')),
  ADD COLUMN guest_id uuid,
  ADD COLUMN submission_id uuid,
  ADD CONSTRAINT wedding_wishes_variant_event_side_fk
    FOREIGN KEY (invitation_variant_id, event_id, host_side)
    REFERENCES public.wedding_invitation_variants(id, event_id, host_side),
  ADD CONSTRAINT wedding_wishes_guest_variant_fk
    FOREIGN KEY (guest_id, invitation_variant_id)
    REFERENCES public.wedding_guests(id, invitation_variant_id),
  ADD CONSTRAINT wedding_wishes_new_submission_check CHECK (
    invitation_variant_id IS NULL OR (
      event_id IS NOT NULL AND host_side IS NOT NULL AND submission_id IS NOT NULL
      AND guest_name IS NOT NULL AND length(trim(guest_name)) BETWEEN 1 AND 120
      AND message IS NOT NULL AND length(trim(message)) BETWEEN 1 AND 2000
    )
  );

-- Confirmed by the live preflight: the old named check permits only 1..20.
-- Preserve that range for legacy rows and add zero only for a new declined RSVP.
-- The new-submission check above separately caps new attending responses at 5.
ALTER TABLE public.wedding_rsvp
  DROP CONSTRAINT IF EXISTS wedding_rsvp_guest_count_check,
  ADD CONSTRAINT wedding_rsvp_guest_count_check CHECK (
    guest_count BETWEEN 1 AND 20 OR
    (invitation_variant_id IS NOT NULL AND attendance = 'no' AND guest_count = 0)
  );

CREATE UNIQUE INDEX wedding_rsvp_submission_id_unique
  ON public.wedding_rsvp(submission_id);
CREATE UNIQUE INDEX wedding_rsvp_guest_event_unique
  ON public.wedding_rsvp(guest_id, event_id);
CREATE UNIQUE INDEX wedding_wishes_submission_id_unique
  ON public.wedding_wishes(submission_id);
CREATE INDEX wedding_wishes_side_created_id_idx
  ON public.wedding_wishes(host_side, created_at DESC, id DESC);

ALTER TABLE public.wedding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_invitation_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_invitation_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_guests ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.wedding_settings, public.wedding_events,
  public.wedding_invitation_variants, public.wedding_invitation_contents,
  public.wedding_guests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.wedding_settings, public.wedding_events,
  public.wedding_invitation_variants, public.wedding_invitation_contents,
  public.wedding_guests TO service_role;

COMMIT;
