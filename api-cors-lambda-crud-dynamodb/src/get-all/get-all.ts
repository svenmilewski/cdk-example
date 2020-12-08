import {DynamoDB} from "aws-sdk";
import {APIGatewayProxyResultV2} from "aws-lambda";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import ScanInput = DocumentClient.ScanInput;

const db = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async () : Promise <APIGatewayProxyResultV2> => {

  const params: ScanInput = {
    TableName: TABLE_NAME
  };

  try {
    const response = await db.scan(params).promise();
    return { statusCode: 200, body: JSON.stringify(response.Items) };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError)};
  }
};
