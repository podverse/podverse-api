CREATE INDEX "IDX_4bafa72e53c0f10cf22f765c9b" ON public.podcasts USING btree
("hasVideo", "pastAllTimeTotalUniquePageviews");

CREATE INDEX "IDX_2dd75798bb599b9ced1c491c02" ON public.podcasts USING btree
("hasVideo", "pastHourTotalUniquePageviews");

CREATE INDEX "IDX_6a47478e3666025fe25cc64276" ON public.podcasts USING btree
("hasVideo", "pastDayTotalUniquePageviews");

CREATE INDEX "IDX_acefc4d091700acb0d7faf25b8" ON public.podcasts USING btree
("hasVideo", "pastWeekTotalUniquePageviews");

CREATE INDEX "IDX_6d6e0875555cd123471bc8ced4" ON public.podcasts USING btree
("hasVideo", "pastMonthTotalUniquePageviews");

CREATE INDEX "IDX_541f35addc2a77f2f28168953d" ON public.podcasts USING btree
("hasVideo", "pastYearTotalUniquePageviews");
