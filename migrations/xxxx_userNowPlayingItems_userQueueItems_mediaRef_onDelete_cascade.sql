alter table public."userNowPlayingItems"
drop constraint "FK_fde0d2aff935c3301266e38a110",
add constraint "FK_fde0d2aff935c3301266e38a110"
   foreign key ("mediaRefId")
   references "mediaRefs"("id")
   on delete cascade;

alter table public."userQueueItems"
drop constraint "FK_5d3167b5c0df34e3a550fd8d6e8",
add constraint "FK_5d3167b5c0df34e3a550fd8d6e8"
   foreign key ("mediaRefId")
   references "mediaRefs"("id")
   on delete cascade;
