#!/bin/sh
set -e

echo "Running migrations..."
npm run prisma:migrate:deploy

echo "Running seed..."
npx prisma db seed || echo "Seed already executed or failed"

echo "Starting application..."
exec npm run start