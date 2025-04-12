#!/bin/bash

echo "Starting LocalStack for deployment testing..."

# Check if running in CI environment
if [ -n "$CI" ]; then
  echo "Running in CI environment"
fi

# Stop existing container if it exists
docker stop localstack 2>/dev/null || true
docker rm localstack 2>/dev/null || true

# Start LocalStack
docker run -d --name localstack \
  -p 4566:4566 \
  -e SERVICES=serverless,lambda,s3,dynamodb,sns,sqs \
  -e DEBUG=1 \
  localstack/localstack

echo "Waiting for LocalStack to be ready..."
# More reliable way to check if LocalStack is ready
timeout 60 bash -c 'until docker logs localstack 2>&1 | grep -q "Ready."; do sleep 1; done'
echo "LocalStack is ready!"

# Setup initial resources
echo "Setting up initial resources..."
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Create required resources using Node.js script
# Make it work whether we're running from project root or scripts directory
if [ -f "./src/tests/setup-localstack.js" ]; then
  node ./src/tests/setup-localstack.js
elif [ -f "../src/tests/setup-localstack.js" ]; then
  node ../src/tests/setup-localstack.js
else
  # If JS file doesn't exist yet (TS not compiled), run the TS file directly with ts-node
  if command -v npx &> /dev/null; then
    if [ -f "./src/tests/setup-localstack.ts" ]; then
      npx ts-node ./src/tests/setup-localstack.ts
    elif [ -f "../src/tests/setup-localstack.ts" ]; then
      npx ts-node ../src/tests/setup-localstack.ts
    else
      echo "Could not find setup-localstack script!"
      exit 1
    fi
  else
    echo "Neither compiled JS nor npx found to run setup script!"
    exit 1
  fi
fi

echo "LocalStack environment is ready for deployment!"