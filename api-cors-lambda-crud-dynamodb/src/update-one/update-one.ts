import {DynamoDB} from "aws-sdk";
import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from "aws-lambda";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import UpdateItemInput = DocumentClient.UpdateItemInput;

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {

  if (!event.body) {
    return {statusCode: 400, body: 'invalid request, you are missing the parameter body'};
  }

  const editedItemId = event.pathParameters?.id;
  if (!editedItemId) {
    return {statusCode: 400, body: 'invalid request, you are missing the path parameter id'};
  }

  const editedItem = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  const editedItemProperties = Object.keys(editedItem);
  if (!editedItem || editedItemProperties.length < 1) {
    return {statusCode: 400, body: 'invalid request, no arguments provided'};
  }

  const firstProperty = editedItemProperties.splice(0, 1);
  const params: UpdateItemInput = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: editedItemId
    },
    UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
    ExpressionAttributeValues: {},
    ReturnValues: 'UPDATED_NEW'
  }

  if (params.ExpressionAttributeValues) params.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[`${firstProperty}`];

  editedItemProperties.forEach(property => {
    params.UpdateExpression += `, ${property} = :${property}`;
    if (params.ExpressionAttributeValues) params.ExpressionAttributeValues[`:${property}`] = editedItem[property];
  });

  try {
    await db.update(params).promise();
    return {statusCode: 204, body: ''};
  } catch (dbError) {
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
      DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
    return {statusCode: 500, body: errorResponse};
  }
};
