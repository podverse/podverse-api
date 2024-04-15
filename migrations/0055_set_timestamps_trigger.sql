-- Create the function to set timestamps with triggers

CREATE FUNCTION set_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW."createdAt" := COALESCE(NEW."createdAt", NOW());
    NEW."updatedAt" := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
