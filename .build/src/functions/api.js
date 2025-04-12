"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const uuid_1 = require("uuid");
const aws_clients_1 = require("../libs/aws-clients");
const handler = async (event) => {
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
            const result = await aws_clients_1.dynamoDb.scan({
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
            const result = await aws_clients_1.dynamoDb.get({
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
            const id = (0, uuid_1.v4)();
            // Create item in DynamoDB
            const item = {
                id,
                data,
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            await aws_clients_1.dynamoDb.put({
                TableName: process.env.DYNAMODB_TABLE || '',
                Item: item,
            }).promise();
            // Store in S3
            await aws_clients_1.s3.putObject({
                Bucket: process.env.S3_BUCKET || '',
                Key: `data/${id}.json`,
                Body: JSON.stringify(item),
                ContentType: 'application/json',
            }).promise();
            // Send message to SQS
            await aws_clients_1.sqs.sendMessage({
                QueueUrl: process.env.SQS_QUEUE_URL || '',
                MessageBody: JSON.stringify({
                    action: 'ITEM_CREATED',
                    item,
                }),
            }).promise();
            // Publish to SNS
            await aws_clients_1.sns.publish({
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
    }
    catch (error) {
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
exports.handler = handler;
//# sourceMappingURL=api.js.map