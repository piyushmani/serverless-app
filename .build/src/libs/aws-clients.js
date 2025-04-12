"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sns = exports.sqs = exports.s3 = exports.dynamoDb = void 0;
const aws_sdk_1 = require("aws-sdk");
const aws_sdk_2 = require("aws-sdk");
const aws_sdk_3 = require("aws-sdk");
const aws_sdk_4 = require("aws-sdk");
// Initialize the AWS SDK clients
exports.dynamoDb = new aws_sdk_1.DynamoDB.DocumentClient();
exports.s3 = new aws_sdk_2.S3();
exports.sqs = new aws_sdk_3.SQS();
exports.sns = new aws_sdk_4.SNS();
//# sourceMappingURL=aws-clients.js.map