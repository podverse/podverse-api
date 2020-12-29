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
-- Name: userQueueItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."userQueueItems" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "queuePosition" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "episodeId" character varying(14),
    "mediaRefId" character varying(14),
    "ownerId" character varying(14) NOT NULL
);


ALTER TABLE public."userQueueItems" OWNER TO postgres;

--
-- Name: userQueueItems PK_1d8e6ae23c7d3b62412c010d281; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userQueueItems"
    ADD CONSTRAINT "PK_1d8e6ae23c7d3b62412c010d281" PRIMARY KEY (id);


--
-- Name: IDX_b651ccc2eec2cb1936244ea742; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b651ccc2eec2cb1936244ea742" ON public."userQueueItems" USING btree ("ownerId");


--
-- Name: userQueueItems FK_2367e28002d5b0e577e5084b967; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userQueueItems"
    ADD CONSTRAINT "FK_2367e28002d5b0e577e5084b967" FOREIGN KEY ("episodeId") REFERENCES public.episodes(id);


--
-- Name: userQueueItems FK_5d3167b5c0df34e3a550fd8d6e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userQueueItems"
    ADD CONSTRAINT "FK_5d3167b5c0df34e3a550fd8d6e8" FOREIGN KEY ("mediaRefId") REFERENCES public."mediaRefs"(id);


--
-- Name: userQueueItems FK_b651ccc2eec2cb1936244ea742a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userQueueItems"
    ADD CONSTRAINT "FK_b651ccc2eec2cb1936244ea742a" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

