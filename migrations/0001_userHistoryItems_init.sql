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
-- Name: userHistoryItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."userHistoryItems" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "orderChangedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "userPlaybackPosition" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "episodeId" character varying(14),
    "mediaRefId" character varying(14),
    "ownerId" character varying(14) NOT NULL
);


ALTER TABLE public."userHistoryItems" OWNER TO postgres;

--
-- Name: userHistoryItems PK_1e5be3f925a1a9b2b81f47b26a8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userHistoryItems"
    ADD CONSTRAINT "PK_1e5be3f925a1a9b2b81f47b26a8" PRIMARY KEY (id);


--
-- Name: IDX_e43c5eb439402e4f0622673661; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e43c5eb439402e4f0622673661" ON public."userHistoryItems" USING btree ("ownerId");


--
-- Name: userHistoryItems FK_acfcaa8bcf9c198372a9b90207b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userHistoryItems"
    ADD CONSTRAINT "FK_acfcaa8bcf9c198372a9b90207b" FOREIGN KEY ("episodeId") REFERENCES public.episodes(id) ON DELETE CASCADE;


--
-- Name: userHistoryItems FK_e43c5eb439402e4f06226736619; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userHistoryItems"
    ADD CONSTRAINT "FK_e43c5eb439402e4f06226736619" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: userHistoryItems FK_e87e78a873e585bbd2f544ee2ae; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userHistoryItems"
    ADD CONSTRAINT "FK_e87e78a873e585bbd2f544ee2ae" FOREIGN KEY ("mediaRefId") REFERENCES public."mediaRefs"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

