--
-- Name: podcasts_medium_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.podcasts_medium_enum AS ENUM
(
    'podcast',
    'music',
    'video',
    'film',
    'audiobook',
    'newsletter',
    'blog',
    'music-video'
);


ALTER TYPE public.podcasts_medium_enum OWNER TO postgres;

ALTER TABLE ONLY public."podcasts"
    ADD COLUMN medium public.podcasts_medium_enum DEFAULT 'podcast'::public.podcasts_medium_enum NOT NULL;