import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { dynamoDb, s3, sqs, sns } from '../libs/aws-clients';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Set default headers for CORS
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    };

    // GET /api
    if (event.httpMethod === 'GET' && event.pathParameters === null) {
      // Scan DynamoDB for all items
      const result = await dynamoDb.scan({
        TableName: process.env.DYNAMODB_TABLE || '',
      }).promise();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Items),
      };
    }

    // GET /api/{id}
    if (event.httpMethod === 'GET' && event.pathParameters && event.pathParameters.id) {
      // Get item from DynamoDB
      const result = await dynamoDb.get({
        TableName: process.env.DYNAMODB_TABLE || '',
        Key: {
          id: event.pathParameters.id,
        },
      }).promise();

      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Item not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Item),
      };
    }

    // POST /api
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const timestamp = new Date().toISOString();
      const id = uuidv4();

      // Create item in DynamoDB
      const item = {
        id,
        data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await dynamoDb.put({
        TableName: process.env.DYNAMODB_TABLE || '',
        Item: item,
      }).promise();

      // Store in S3
      await s3.putObject({
        Bucket: process.env.S3_BUCKET || '',
        Key: `data/${id}.json`,
        Body: JSON.stringify(item),
        ContentType: 'application/json',
      }).promise();

      // Send message to SQS
      await sqs.sendMessage({
        QueueUrl: process.env.SQS_QUEUE_URL || '',
        MessageBody: JSON.stringify({
          action: 'ITEM_CREATED',
          item,
        }),
      }).promise();

      // Publish to SNS
      await sns.publish({
        TopicArn: process.env.SNS_TOPIC_ARN || '',
        Message: JSON.stringify({
          action: 'ITEM_CREATED',
          item,
        }),
        Subject: 'New Item Created',
      }).promise();

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(item),
      };
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};