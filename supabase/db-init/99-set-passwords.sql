-- Set passwords for internal Supabase roles so GoTrue and PostgREST can connect
ALTER USER supabase_auth_admin WITH PASSWORD 'postgres';
ALTER USER authenticator WITH PASSWORD 'postgres';
ALTER USER supabase_storage_admin WITH PASSWORD 'postgres';
