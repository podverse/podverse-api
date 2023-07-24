-- Create upDevices table

CREATE TABLE public."upDevices" (
    "upEndpoint" character varying,
    "upPublicKey" character varying NOT NULL,
    "upAuthKey" character varying NOT NULL,
    "userId" character varying(14) references users(id) ON DELETE CASCADE,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("upEndpoint")
);

ALTER TABLE public."upDevices" OWNER TO postgres;

CREATE INDEX "IDX_upDevices_userId" ON public."upDevices" USING btree ("userId");
