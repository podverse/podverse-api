ALTER TABLE "liveItems"
  ALTER "start" TYPE timestamptz USING "start" AT TIME ZONE 'UTC'
, ALTER "start" SET DEFAULT now();

ALTER TABLE "liveItems"
  ALTER "end" TYPE timestamptz USING "end" AT TIME ZONE 'UTC'
, ALTER "end" SET DEFAULT now();
