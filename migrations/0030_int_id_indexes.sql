/*
  NOTE: the int_id columns exist mainly so that the Manticore index jobs have
  a reliable numeric identifier for selecting ~10000 rows at a time as part
  of the index operation.
*/

CREATE INDEX CONCURRENTLY "authors_int_id_index" ON "authors" ("int_id");
CREATE INDEX CONCURRENTLY "categories_int_id_index" ON "categories" ("int_id");
CREATE INDEX CONCURRENTLY "feedUrls_int_id_index" ON "feedUrls" ("int_id");
CREATE INDEX CONCURRENTLY "mediaRefs_int_id_index" ON "mediaRefs" ("int_id");
CREATE INDEX CONCURRENTLY "playlists_int_id_index" ON "playlists" ("int_id");
CREATE INDEX CONCURRENTLY "podcasts_int_id_index" ON "podcasts" ("int_id");
CREATE INDEX CONCURRENTLY "users_int_id_index" ON "users" ("int_id");
