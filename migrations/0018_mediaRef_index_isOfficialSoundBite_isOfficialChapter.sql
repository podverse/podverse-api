CREATE INDEX index_mediaRefs_isOfficialChapter ON "mediaRefs" ("isOfficialChapter");
CREATE INDEX index_mediaRefs_isOfficialSoundBite ON "mediaRefs" ("isOfficialSoundBite");
CREATE INDEX CONCURRENTLY "index_mediaRefs_createdAt" ON "mediaRefs" ("createdAt" DESC);
