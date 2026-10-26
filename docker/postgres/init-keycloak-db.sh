#!/bin/bash
set -e

# Create a dedicated database for Keycloak if it doesn't already exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE edubridge_keycloak'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'edubridge_keycloak')\gexec
    GRANT ALL PRIVILEGES ON DATABASE edubridge_keycloak TO $POSTGRES_USER;
EOSQL
