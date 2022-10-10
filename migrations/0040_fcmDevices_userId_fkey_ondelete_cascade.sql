alter table public."fcmDevices"
drop constraint "fcmDevices_userId_fkey",
add constraint "fcmDevices_userId_fkey"
   foreign key ("userId")
   references "users"("id")
   on delete cascade;

alter table public."notifications"
drop constraint "notifications_userId_fkey",
add constraint "notifications_userId_fkey"
   foreign key ("userId")
   references "users"("id")
   on delete cascade;
