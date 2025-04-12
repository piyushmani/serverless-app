"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_clients_1 = require("../libs/aws-clients");
const handler = async (event) => {
    try {
        for (const record of event.Records) {
            console.log('Processing SQS message:', record.messageId);
            // Parse the message body
            const message = JSON.parse(record.body);
            console.log('Message body:', message);
            // Process based on action type
            if (message.action === 'ITEM_CREATED') {
                // Update item processing status in DynamoDB
                await aws_clients_1.dynamoDb.update({
                    TableName: process.env.DYNAMODB_TABLE || '',
                    Key: {
                        id: message.item.id,
                    },
                    UpdateExpression: 'SET processed = :processed, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                        ':processed': true,
                        ':updatedAt': new Date().toISOString(),
                    },
                }).promise();
                // Notify via SNS that processing is complete
                await aws_clients_1.sns.publish({
                    TopicArn: process.env.SNS_TOPIC_ARN || '',
                    Message: JSON.stringify({
                        action: 'ITEM_PROCESSED',
                        item: message.item,
                    }),
                    Subject: 'Item Processing Complete',
                }).promise();
            }
        }
    }
    catch (error) {
        console.error('Error processing SQS messages:', error);
        throw error; // Rethrow to trigger SQS retry
    }
};
exports.handler = handler;
//# sourceMappingURL=queue.js.map