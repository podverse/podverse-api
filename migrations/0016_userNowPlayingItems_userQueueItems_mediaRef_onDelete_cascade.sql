alter table public."userNowPlayingItems"
drop constraint "FK_fde0d2aff935c3301266e38a110",
add constraint "FK_fde0d2aff935c3301266e38a110"
   foreign key ("mediaRefId")
   references "mediaRefs"("id")
   on delete cascade;

alter table public."userNowPlayingItems"
drop constraint "FK_fde0d2aff935c3301266e38a110",
add constraint "FK_fde0d2aff935c3301266e38a110"
   foreign key ("mediaRefId")
   references "mediaRefs"("id")
   on delete cascade;
