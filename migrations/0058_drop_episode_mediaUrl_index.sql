-- Optionally could be done CONCURRENTLY

-- drop episodes.mediaUrl index
DROP INDEX "IDX_da6fc438d37c65927437b3107f";

-- drop episodes.title index
DROP INDEX "IDX_acd3fd6c4dff47ee1cd00ac582";

-- drop podcasts.title index
DROP INDEX "IDX_a65598c2450c4f601ecb341994";

-- drop podcasts.shrunkImageLastUpdated index
DROP INDEX "IDX_30403fff476188bfb18fd38f10";

--drop podcasts.feedLastUpdated index
DROP INDEX "IDX_09ae4505e3b4b2ddb27486187a";
