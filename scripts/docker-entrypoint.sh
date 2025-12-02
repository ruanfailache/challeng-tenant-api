#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Running seed..."
npx prisma db seed || echo "Seed already executed or failed"

echo "Starting application..."
exec node dist/main