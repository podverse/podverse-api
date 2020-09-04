/mnt/c/Program\ Files/pgAdmin\ 4/v4/runtime/psql.exe -h 127.0.0.1 -p 5432 -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" >/dev/null
echo "database dropped"
/mnt/c/Program\ Files/pgAdmin\ 4/v4/runtime/psql.exe -h 127.0.0.1 -p 5432 -U postgres -f ../podverse-ops/sample-database/qa-database.sql >/dev/null
echo "database restored"
jest --config='jest.integration.config.js' --detectOpenHandles --forceExit --runInBand
