import { SQSEvent, SQSRecord } from 'aws-lambda';
import { dynamoDb, sns } from '../libs/aws-clients';

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      console.log('Processing SQS message:', record.messageId);
      
      // Parse the message body
      const message = JSON.parse(record.body);
      console.log('Message body:', message);

      // Process based on action type
      if (message.action === 'ITEM_CREATED') {
        // Update item processing status in DynamoDB
        await dynamoDb.update({
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
        await sns.publish({
          TopicArn: process.env.SNS_TOPIC_ARN || '',
          Message: JSON.stringify({
            action: 'ITEM_PROCESSED',
            item: message.item,
          }),
          Subject: 'Item Processing Complete',
        }).promise();
      }
    }
  } catch (error) {
    console.error('Error processing SQS messages:', error);
    throw error; // Rethrow to trigger SQS retry
  }
};