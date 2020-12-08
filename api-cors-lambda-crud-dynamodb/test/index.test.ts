import '@aws-cdk/assert/jest';
import {ApiLambdaCrudDynamoDBStack} from "../index";
import {App} from "@aws-cdk/core";
import {ResourcePart, SynthUtils} from "@aws-cdk/assert";

describe('Test stack', () => {
  it('should be the same', async () => {
    const app = new App();
    const stack = new ApiLambdaCrudDynamoDBStack(app, "TestStack");
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });

  it('dynamodb should delete after destruction', async () => {
    const app = new App();
    const stack = new ApiLambdaCrudDynamoDBStack(app, "TestStack");
    expect(stack).toHaveResourceLike("AWS::DynamoDB::Table", {
      DeletionPolicy: "Delete"
    },
      ResourcePart.CompleteDefinition
    )
  });
});
