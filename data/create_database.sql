-- open a terminal and run the following command from the root of the project

-- 1) sudo -i -u postgres
--   "-i" flag is used to login as the postgres user
--   "-u" flag is used to specify the user to login as

-- 2) psql -f data/create_database.sql
--   "-f" flag is used to specify the file to run

-- 3) psql -U marion -d noita < data/create_tables.sql
--   "-U" flag is used to specify the user to run the command as
--   "-d" flag is used to specify the database to run the command on
--   "<" is used to specify the file to run

-- 4) psql -U mountify < data/seeding.sql

CREATE USER marion WITH PASSWORD 'C501553p!1';

CREATE DATABASE noita OWNER marion;