-- Create the function to set timestamps with triggers

CREATE FUNCTION set_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
