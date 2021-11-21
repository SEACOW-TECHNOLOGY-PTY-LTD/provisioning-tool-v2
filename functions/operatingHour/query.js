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
        x => x.phoneNumber.includes(phoneNumber)) : [];

    if (items.length > 0) return callback(null, utils.response('json', {
      Name: items[0].name,
      PhoneNumber: items[0].phoneNumber,
      WorkspaceSid: items[0].workspaceSid,
      Timeout: items[0].timeout,
      Priority: items[0].priority,
      TaskChannel: items[0].taskChannel,
      WorkflowSid: items[0].workflowSid,
      Type: items[0].type,
      QueueSid: items[0].queueSid || '',
      WorkerSid: items[0].workerSid || '',
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