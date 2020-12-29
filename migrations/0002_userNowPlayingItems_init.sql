--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5 (Debian 11.5-3.pgdg90+1)
-- Dumped by pg_dump version 12.4

-- SET statement_timeout = 0;
-- SET lock_timeout = 0;
-- SET idle_in_transaction_session_timeout = 0;
-- SET client_encoding = 'UTF8';
-- SET standard_conforming_strings = on;
-- SELECT pg_catalog.set_config('search_path', '', false);
-- SET check_function_bodies = false;
-- SET xmloption = content;
-- SET client_min_messages = warning;
-- SET row_security = off;

-- SET default_tablespace = '';

--
-- Name: userNowPlayingItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."userNowPlayingItems" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userPlaybackPosition" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "episodeId" character varying(14),
    "mediaRefId" character varying(14),
    "ownerId" character varying(14) NOT NULL
);


ALTER TABLE public."userNowPlayingItems" OWNER TO postgres;

--
-- Name: userNowPlayingItems PK_88121e9a38cdc5823517e43b773; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userNowPlayingItems"
    ADD CONSTRAINT "PK_88121e9a38cdc5823517e43b773" PRIMARY KEY (id);


--
-- Name: userNowPlayingItems REL_5b75c715cf270b9fcd22e84a2d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userNowPlayingItems"
    ADD CONSTRAINT "REL_5b75c715cf270b9fcd22e84a2d" UNIQUE ("ownerId");


--
-- Name: userNowPlayingItems FK_47b0e8ccc83c3a9f97ee4b2e343; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userNowPlayingItems"
    ADD CONSTRAINT "FK_47b0e8ccc83c3a9f97ee4b2e343" FOREIGN KEY ("episodeId") REFERENCES public.episodes(id);


--
-- Name: userNowPlayingItems FK_5b75c715cf270b9fcd22e84a2dd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userNowPlayingItems"
    ADD CONSTRAINT "FK_5b75c715cf270b9fcd22e84a2dd" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: userNowPlayingItems FK_fde0d2aff935c3301266e38a110; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userNowPlayingItems"
    ADD CONSTRAINT "FK_fde0d2aff935c3301266e38a110" FOREIGN KEY ("mediaRefId") REFERENCES public."mediaRefs"(id);


--
-- PostgreSQL database dump complete
--

