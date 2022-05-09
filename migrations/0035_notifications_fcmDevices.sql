-- Create FCMDevices table

CREATE TABLE public."fcmDevices" (
    "fcmToken" character varying,
    "userId" character varying(14) references users(id),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("fcmToken")
);

ALTER TABLE public."fcmDevices" OWNER TO postgres;

CREATE INDEX "IDX_fcmDevices_userId" ON public."fcmDevices" USING btree ("userId");

-- Create Notifications table

CREATE TABLE public."notifications" (
    "podcastId" character varying(14) references podcasts(id),
    "userId" character varying(14) references users(id),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    PRIMARY KEY ("podcastId", "userId")
);

ALTER TABLE public."notifications" OWNER TO postgres;
