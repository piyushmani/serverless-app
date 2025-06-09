#!/bin/bash

echo "Deploying to docker LocalStack..."

# Set environment variables for LocalStack
export IS_LOCAL=true
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
export LOCALSTACK_HOSTNAME=localhost

# Check if running in CI environment and adjust if needed
if [ -n "$CI" ]; then
  echo "Running deployment in CI environment"
fi

# Deploy using serverless
npx serverless deploy --stage local

# Wait a moment for deployment to complete
sleep 5

echo "Deployment to LocalStack complete!"

# Check if deployment succeeded by listing resources
echo "Verifying deployment by checking created resources:"

echo "Lambda functions:"
aws --endpoint-url=http://localhost:4566 lambda list-functions --query "Functions[?starts_with(FunctionName, 'my-typescript-app')].FunctionName"

echo "Deployment successful if resources are listed above."
