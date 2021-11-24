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
    label,
    content,
  } = event;

  try {
    const params = {
      TableName: context['OPERATING_HOUR_TABLE'],
      Key: {
        Label: label,
      },
      UpdateExpression: 'set ' +
          '#Content = :Content',
      ExpressionAttributeNames: {
        '#Content': 'Content',
      },
      ExpressionAttributeValues: {
        ':Content': content,
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