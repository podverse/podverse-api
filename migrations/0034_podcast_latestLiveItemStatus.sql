--
-- Name: podcasts_latest_live_item_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.podcasts_latest_live_item_status_enum AS ENUM
(
    'pending',
    'live',
    'ended',
    'none'
);


ALTER TYPE public.podcasts_latest_live_item_status_enum OWNER TO postgres;

ALTER TABLE ONLY public."podcasts"
    ADD COLUMN "latestLiveItemStatus" public.podcasts_latest_live_item_status_enum DEFAULT 'none'::public.podcasts_latest_live_item_status_enum NOT NULL;
