CREATE TYPE public.userQueueItems_medium_enum AS ENUM
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

ALTER TYPE public.userQueueItems_medium_enum OWNER TO postgres;

ALTER TABLE ONLY public."userQueueItems"
    ADD COLUMN medium public.userQueueItems_medium_enum DEFAULT 'mixed'::public.userQueueItems_medium_enum NOT NULL;
