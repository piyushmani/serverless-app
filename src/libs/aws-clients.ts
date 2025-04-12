import { DynamoDB, S3, SQS, SNS } from 'aws-sdk';

const isLocal = process.env.IS_LOCAL === 'true';
const region = process.env.AWS_REGION || 'us-east-1';
const localstackHostname = process.env.LOCALSTACK_HOSTNAME || 'localhost';


const getConfig = (service: string) => {
  const baseConfig = {
    region,
  };

  if (isLocal) {
    console.log(`Configuring ${service} client for LocalStack`);
    return {
      ...baseConfig,
      endpoint: `http://${localstackHostname}:4566`,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      s3ForcePathStyle: true,
    };
  }
  
  return baseConfig;
};


export const dynamoDb = new DynamoDB.DocumentClient(getConfig('DynamoDB'));
export const s3 = new S3(getConfig('S3'));
export const sqs = new SQS(getConfig('SQS'));
export const sns = new SNS(getConfig('SNS'));


export const logAction = (service: string, action: string, params: any) => {
  if (isLocal) {
    console.log(`[${service}] ${action}:`, JSON.stringify(params, null, 2));
  }
};