CREATE INDEX CONCURRENTLY
	"IDX_liveItems_start"
    ON public."liveItems" USING btree ("start");
    
CREATE INDEX CONCURRENTLY
	"IDX_liveItems_end"
    ON public."liveItems" USING btree ("end");
    
CREATE INDEX CONCURRENTLY
	"IDX_liveItems_stats"
    ON public."liveItems" USING btree ("status");
