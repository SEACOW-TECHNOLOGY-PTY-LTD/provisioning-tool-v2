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
    phoneNumber,
  } = event;
  try {
    const result = await documentClient.scan({
      TableName: context['PHONE_PROVISIONING_TABLE'],
    }).promise();
    const items = result ? result.Items.filter(
        x => x.PhoneNumber.includes(phoneNumber)) : [];

    if (items.length > 0) return callback(null, utils.response('json', {
      name: items[0].Name,
      phoneNumber: items[0].PhoneNumber,
      workspaceSid: items[0].WorkspaceSid,
      timeout: items[0].Timeout,
      priority: items[0].Priority,
      taskChannel: items[0].TaskChannel,
      workflowSid: items[0].WorkflowSid,
      type: items[0].Type,
      queueSid: items[0].QueueSid || '',
      workerSid: items[0].WorkerSid || '',
      enableForward: items[0].EnableForward,
      forwardNumber: items[0].ForwardNumber,
    }));
    else return callback(null, utils.response('json', {
      error: 'Not Found',
    }));
  } catch (e) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};