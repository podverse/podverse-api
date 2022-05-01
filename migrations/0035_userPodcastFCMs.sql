CREATE TABLE public.fcms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "fcm" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "podcastId" character varying(14) NOT NULL,
    "userId" character varying(14) NOT NULL,
    UNIQUE ("fcm", "podcastId")
);

ALTER TABLE public.fcms OWNER TO postgres;

ALTER TABLE ONLY public.fcms
    ADD CONSTRAINT "PK_fcms_id" PRIMARY KEY (id);

ALTER TABLE ONLY public.fcms
    ADD CONSTRAINT "FK_fcms_podcastId" FOREIGN KEY ("podcastId") REFERENCES public.podcasts(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.fcms
    ADD CONSTRAINT "FK_fcms_userId" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

CREATE INDEX "IDX_fcms_fcm" ON public.fcms USING btree ("fcm");

-- HOW DO WE CREATE INDEXES FOR THE MANY-TO-ONE RELATIONSHIPS?
-- DO WE EVEN NEED TO?

-- CREATE INDEX "IDX_fcms_podcastId" ON public."podcastId" USING btree ("podcastId");

-- CREATE INDEX "IDX_fcms_userId" ON public."userId" USING btree ("userId");
