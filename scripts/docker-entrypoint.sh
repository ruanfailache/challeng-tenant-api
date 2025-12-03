#!/bin/sh
set -e

echo "Waiting for LocalStack..."
until curl -sf http://localstack:4566/_localstack/health > /dev/null 2>&1; do
  echo "Waiting for LocalStack to be ready..."
  sleep 2
done
echo "LocalStack is ready!"

echo "Creating S3 bucket..."
aws --endpoint-url=http://localstack:4566 s3 mb s3://${AWS_S3_BUCKET} 2>/dev/null || echo "Bucket already exists or creation failed"
echo "S3 bucket created or already exists"

echo "Verifying SES email address..."
aws --endpoint-url=http://localstack:4566 ses verify-email-identity --email-address ${AWS_SES_SOURCE_EMAIL} 2>/dev/null || echo "Email already verified or verification failed"
echo "SES email verified or already verified"

echo "Running migrations..."
npm run prisma:migrate:deploy

echo "Running seed..."
npx prisma db seed || echo "Seed already executed or failed"

echo "Starting application..."
exec npm run start