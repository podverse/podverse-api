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
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD COLUMN "userNowPlayingItemId" uuid;
--
-- Name: users UQ_94bd438add251d5ba3e72d023c3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_94bd438add251d5ba3e72d023c3" UNIQUE ("userNowPlayingItemId");

--
-- Name: users FK_94bd438add251d5ba3e72d023c3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "FK_94bd438add251d5ba3e72d023c3" FOREIGN KEY ("userNowPlayingItemId") REFERENCES public."userNowPlayingItems"(id);

--
-- PostgreSQL database dump complete
--

