"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAction = exports.sns = exports.sqs = exports.s3 = exports.dynamoDb = void 0;
const aws_sdk_1 = require("aws-sdk");
const isLocal = process.env.IS_LOCAL === 'true';
const region = process.env.AWS_REGION || 'us-east-1';
const localstackHostname = process.env.LOCALSTACK_HOSTNAME || 'localhost';
const getConfig = (service) => {
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
exports.dynamoDb = new aws_sdk_1.DynamoDB.DocumentClient(getConfig('DynamoDB'));
exports.s3 = new aws_sdk_1.S3(getConfig('S3'));
exports.sqs = new aws_sdk_1.SQS(getConfig('SQS'));
exports.sns = new aws_sdk_1.SNS(getConfig('SNS'));
const logAction = (service, action, params) => {
    if (isLocal) {
        console.log(`[${service}] ${action}:`, JSON.stringify(params, null, 2));
    }
};
exports.logAction = logAction;
//# sourceMappingURL=aws-clients.js.map