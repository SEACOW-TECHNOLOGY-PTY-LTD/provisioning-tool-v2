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
  } = event;

  try {
    const params = {
      TableName: context['PHONE_PROVISIONING_TABLE'],
      Key: {
        Id: Id,
      },
      UpdateExpression: 'set ' +
          '#name = :name, ' +
          '#enableForward = :enableForward, ' +
          '#forwardNumber = :forwardNumber, ' +
          '#workflowSid = :workflowSid, ' +
          '#type = :type, ' +
          '#queueSid = :queueSid, ' +
          '#workerSid = :workerSid',
      ExpressionAttributeNames: {
        '#name': 'Name',
        '#enableForward': 'EnableForward',
        '#forwardNumber': 'ForwardNumber',
        '#workflowSid': 'WorkflowSid',
        '#type': 'Type',
        '#queueSid': 'QueueSid',
        '#workerSid': 'WorkerSid',
      },
      ExpressionAttributeValues: {
        ':name': 'Free',
        ':enableForward': false,
        ':forwardNumber': '',
        ':workflowSid': '',
        ':type': '',
        ':queueSid': '',
        ':workerSid': '',
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