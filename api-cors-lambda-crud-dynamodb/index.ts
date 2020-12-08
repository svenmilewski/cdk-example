import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as cdk from '@aws-cdk/core';
import { crudLambda } from './constructs/crudLambda';


export class ApiLambdaCrudDynamoDBStack extends cdk.Stack {
  constructor(app: cdk.App, id: string) {
    super(app, id);

    const dynamoTable = new dynamodb.Table(this, 'items', {
      partitionKey: {
        name: 'itemId',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: 'items',

      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    const getOneLambda = crudLambda(this, 'getOneItemFunction', dynamoTable, {
      handler: 'get-one.handler'
    });

    const getAllLambda = crudLambda(this, 'getAllItemsFunction', dynamoTable, {
      handler: 'get-all.handler',
    });

    const createOne = crudLambda(this, 'createItemFunction', dynamoTable, {
      handler: 'create.handler',
    });

    const updateOne = crudLambda(this, 'updateItemFunction', dynamoTable, {
      handler: 'update-one.handler',
    });

    const deleteOne = crudLambda(this, 'deleteItemFunction', dynamoTable, {
      handler: 'delete-one.handler',
    });

    const api = new apigateway.RestApi(this, 'itemsApi', {
      restApiName: 'Items Service'
    });

    const items = api.root.addResource('items');
    const getAllIntegration = new apigateway.LambdaIntegration(getAllLambda);
    items.addMethod('GET', getAllIntegration);

    const createOneIntegration = new apigateway.LambdaIntegration(createOne);
    items.addMethod('POST', createOneIntegration);
    addCorsOptions(items);

    const singleItem = items.addResource('{id}');
    const getOneIntegration = new apigateway.LambdaIntegration(getOneLambda);
    singleItem.addMethod('GET', getOneIntegration);

    const updateOneIntegration = new apigateway.LambdaIntegration(updateOne);
    singleItem.addMethod('PATCH', updateOneIntegration);

    const deleteOneIntegration = new apigateway.LambdaIntegration(deleteOne);
    singleItem.addMethod('DELETE', deleteOneIntegration);
    addCorsOptions(singleItem);
  }
}

export function addCorsOptions(apiResource: apigateway.IResource) {
  apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }]
  })
}

const app = new cdk.App();
new ApiLambdaCrudDynamoDBStack(app, 'ApiLambdaCrudDynamoDBExample');
app.synth();
