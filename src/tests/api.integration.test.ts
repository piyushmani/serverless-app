import axios from 'axios';
import { setupLocalStackResources, teardownLocalStackResources } from './setup-localstack';

// LocalStack endpoint for API Gateway (this is a simulation as LocalStack's API Gateway behaves differently)
const apiEndpoint = 'http://localhost:4566';

describe('API Integration Tests with LocalStack', () => {
  beforeAll(async () => {
    // Setup LocalStack resources before tests
    await setupLocalStackResources();
  });

  afterAll(async () => {
    // Clean up LocalStack resources after tests
    await teardownLocalStackResources();
  });

  test('LocalStack is accessible', async () => {
    try {
      // Simple test to check if LocalStack is responding
      const response = await axios.get(`${apiEndpoint}/health`);
      expect(response.status).toBe(200);
    } catch (error) {
      // LocalStack's health endpoint might not be available, which is okay
      // We just want to make sure LocalStack is running
      expect(error.code).not.toBe('ECONNREFUSED');
    }
  });

  test('DynamoDB operations work in LocalStack', async () => {
    // Testing DynamoDB operations directly with AWS SDK
    const AWS = require('aws-sdk');
    const docClient = new AWS.DynamoDB.DocumentClient({
      endpoint: 'http://localhost:4566',
      region: 'us-east-1',
      credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
    });

    // Create a test item
    const testItem = {
      id: 'test-' + Date.now(),
      name: 'Test Item',
      createdAt: new Date().toISOString()
    };

    // Put item
    await docClient.put({
      TableName: 'my-typescript-app-local-table',
      Item: testItem
    }).promise();

    // Get item
    const result = await docClient.get({
      TableName: 'my-typescript-app-local-table',
      Key: { id: testItem.id }
    }).promise();

    expect(result.Item).toBeDefined();
    expect(result.Item.name).toBe(testItem.name);
  });

  // Add more integration tests for other AWS services
  // For example, testing S3, SQS, SNS operations
});