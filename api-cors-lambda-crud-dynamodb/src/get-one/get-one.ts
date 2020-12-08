import {DynamoDB} from "aws-sdk";
import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from "aws-lambda";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import GetItemInput = DocumentClient.GetItemInput;

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {

  const requestedItemId = event.pathParameters?.id;
  if (!requestedItemId) {
    return {statusCode: 400, body: `Error: You are missing the path parameter id`};
  }

  const params: GetItemInput = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: requestedItemId
    }
  };

  try {
    const response = await db.get(params).promise();
    return {statusCode: 200, body: JSON.stringify(response.Item)};
  } catch (dbError) {
    return {statusCode: 500, body: JSON.stringify(dbError)};
  }
};
