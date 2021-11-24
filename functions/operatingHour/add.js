let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
const {v4: uuidv4} = require('uuid');
const AWS = require('aws-sdk');

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

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
    const item = await documentClient.put({
      TableName: context['OPERATING_HOUR_TABLE'],
      Item: {
        Label: label,
        Content: content,
      },
    }).promise();

    return callback(null, utils.response('json', item));
  } catch (e) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};