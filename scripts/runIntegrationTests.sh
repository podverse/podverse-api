PGPASSWORD=mysecretpw psql -h 0.0.0.0 -p 5432 -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" >/dev/null
echo "database dropped"
PGPASSWORD=mysecretpw psql -h 0.0.0.0 -p 5432 -U postgres -f ../podverse-ops/sample-database/qa-database.sql >/dev/null
echo "database restored"
jest --config='jest.integration.config.js' --detectOpenHandles --forceExit
