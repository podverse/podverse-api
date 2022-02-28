ALTER TABLE ONLY public."episodes"
    ADD COLUMN "contentLinks" text;

CREATE TABLE public."liveItems" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "start" timestamp without time zone NOT NULL,
    "end" timestamp without time zone,
    "status" character varying(14) NOT NULL,
    "episodeId" character varying(14) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public."liveItems"
    ADD CONSTRAINT "PK_liveItems" PRIMARY KEY (id);

ALTER TABLE ONLY public."liveItems"
    ADD CONSTRAINT "FK_liveItems_episode" FOREIGN KEY ("episodeId") REFERENCES public.episodes(id);

