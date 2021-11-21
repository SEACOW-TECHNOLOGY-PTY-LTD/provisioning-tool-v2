let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
const AWS = require('aws-sdk');

exports.handler = async function(context, event, callback) {
  AWS.config.update({
    accessKeyId: context['AWS_ACCESS_KEY_ID'],
    secretAccessKey: context['AWS_SECRET_ACCESS_KEY'],
    region: context['AWS_REGION'],
  });

  const documentClient = new AWS.DynamoDB.DocumentClient();

  const {
    Id,
    enableForward,
    forwardNumber,
  } = event;

  try {
    const params = {
      TableName: context['PHONE_PROVISIONING_TABLE'],
      Key: {
        Id: Id,
      },
      UpdateExpression: 'set ' +
          '#enableForward = :enableForward, ' +
          '#forwardNumber = :forwardNumber',
      ExpressionAttributeNames: {
        '#enableForward': 'EnableForward',
        '#forwardNumber': 'ForwardNumber',
      },
      ExpressionAttributeValues: {
        ':enableForward': enableForward,
        ':forwardNumber': forwardNumber,
      },
    };

    const item = await documentClient.update(params).promise();

    return callback(null, utils.response('json', item));
  } catch (e) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};