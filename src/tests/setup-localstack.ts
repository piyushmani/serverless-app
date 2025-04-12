import AWS from 'aws-sdk';
import { execSync } from 'child_process';

// Configure AWS SDK for LocalStack
process.env.IS_LOCAL = 'true';
const endpoint = 'http://localhost:4566';
const region = 'us-east-1';
const credentials = { accessKeyId: 'test', secretAccessKey: 'test' };

// Initialize clients
const dynamoDB = new AWS.DynamoDB({ endpoint, region, credentials });
const s3 = new AWS.S3({ endpoint, region, credentials, s3ForcePathStyle: true });
const sqs = new AWS.SQS({ endpoint, region, credentials });
const sns = new AWS.SNS({ endpoint, region, credentials });

export async function setupLocalStackResources() {
  try {
    console.log('Setting up LocalStack resources for testing...');

    // Create DynamoDB table
    try {
      await dynamoDB.createTable({
        TableName: 'my-typescript-app-local-table',
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
      }).promise();
      console.log('Created DynamoDB table');
    } catch (e: any) {
      
      if (e.code === 'ResourceInUseException') {
        console.log('DynamoDB table already exists');
      } else {
        throw e;
      }
    }

    // Create S3 bucket
    try {
      await s3.createBucket({
        Bucket: 'my-typescript-app-local-bucket'
      }).promise();
      console.log('Created S3 bucket');
    } catch (e: any) {
      if (e.code === 'BucketAlreadyExists' || e.code === 'BucketAlreadyOwnedByYou') {
        console.log('S3 bucket already exists');
      } else {
        throw e;
      }
    }

    // Create SQS queue
    try {
      await sqs.createQueue({
        QueueName: 'my-typescript-app-local-queue'
      }).promise();
      console.log('Created SQS queue');
    } catch (e: any) {
      console.log('Error creating SQS queue:', e.message);
      throw e;
    }

    // Create SNS topic
    try {
      await sns.createTopic({
        Name: 'my-typescript-app-local-topic'
      }).promise();
      console.log('Created SNS topic');
    } catch (e: any) {
      console.log('Error creating SNS topic:', e.message);
      throw e;
    }

    console.log('LocalStack resources setup complete');
  } catch (error) {
    console.error('Error setting up LocalStack resources:', error);
    throw error;
  }
}

export async function teardownLocalStackResources() {
  try {
    console.log('Cleaning up LocalStack resources...');
    
    // Note: In most test scenarios, you might want to leave
    // the resources for inspection after the tests
    // This is here as an example if needed
    
    console.log('LocalStack cleanup complete');
  } catch (error) {
    console.error('Error cleaning up LocalStack resources:', error);
  }
}

// If this file is run directly
if (require.main === module) {
  setupLocalStackResources()
    .then(() => console.log('Setup completed successfully'))
    .catch(err => console.error('Setup failed:', err));
}