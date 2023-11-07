ALTER TABLE ONLY public."playlists"
    ADD COLUMN "isDefault" boolean DEFAULT false NOT NULL;

CREATE TYPE public.playlists_medium_enum AS ENUM
(
    'podcast',
    'music',
    'video',
    'film',
    'audiobook',
    'newsletter',
    'blog',
    'music-video',
    'mixed'
);

ALTER TYPE public.playlists_medium_enum OWNER TO postgres;

ALTER TABLE ONLY public."playlists"
    ADD COLUMN medium public.playlists_medium_enum DEFAULT 'mixed'::public.playlists_medium_enum NOT NULL;

CREATE UNIQUE INDEX playlists_owner_isDefault_medium_unique_idx
    ON public."playlists" ("ownerId", "isDefault", "medium")
    WHERE "playlists"."isDefault" IS TRUE;
