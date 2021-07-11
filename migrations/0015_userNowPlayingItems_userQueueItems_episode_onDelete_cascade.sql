alter table public."userNowPlayingItems"
drop constraint "FK_47b0e8ccc83c3a9f97ee4b2e343",
add constraint "FK_47b0e8ccc83c3a9f97ee4b2e343"
   foreign key ("episodeId")
   references "episodes"("id")
   on delete cascade;
   

alter table public."userQueueItems"
drop constraint "FK_2367e28002d5b0e577e5084b967",
add constraint "FK_2367e28002d5b0e577e5084b967"
   foreign key ("episodeId")
   references "episodes"("id")
   on delete cascade;
