import {DynamoDB} from "aws-sdk";
import {APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context} from "aws-lambda";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import PutItemInput = DocumentClient.PutItemInput;
import PutItemInputAttributeMap = DocumentClient.PutItemInputAttributeMap;
const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: APIGatewayProxyEventV2, context: Context) : Promise <APIGatewayProxyResultV2> => {
  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }
  const item: PutItemInputAttributeMap = typeof event.body === 'object' ? event.body : JSON.parse(event.body);
  item[PRIMARY_KEY] = context.awsRequestId;
  const params: PutItemInput = {
    TableName: TABLE_NAME,
    Item: item
  };

  try {
    await db.put(params).promise();
    return { statusCode: 201, body: '' };
  } catch (dbError) {
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
    DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
    return { statusCode: 500, body: errorResponse };
  }
};
