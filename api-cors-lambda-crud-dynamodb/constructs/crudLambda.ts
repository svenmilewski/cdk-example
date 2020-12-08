import * as lambda from "@aws-cdk/aws-lambda";
import {Stack} from "@aws-cdk/core";
import {FunctionProps} from "@aws-cdk/aws-lambda";
import {Table} from "@aws-cdk/aws-dynamodb";

type crudLambdaProps = Omit<FunctionProps, 'code'|'runtime'|'environment'>;

export const crudLambda = (scope: Stack, id: string, dynamoTable: Table, props: crudLambdaProps): lambda.Function => {
  const function1 = new lambda.Function(scope, id, {
    ...props,
    code: new lambda.AssetCode('src'),
    runtime: lambda.Runtime.NODEJS_10_X,
    environment: {
      TABLE_NAME: dynamoTable.tableName,
      PRIMARY_KEY: 'itemId'
    }
  });
  dynamoTable.grantReadWriteData(function1);
  return function1
}
