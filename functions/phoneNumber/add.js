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
    name = 'Free',
    phoneNumber,
    enableForward,
    forwardNumber,
    workspaceSid = context['TWILIO_WORKSPACE_SID'],
    timeout = 86400,
    priority = 20,
    taskChannel = 'voice',
    workflowSid = '',
    type = '',
    queueSid = '',
    workerSid = '',
    phoneSource = 'Twilio',
  } = event;

  try {
    await client.lookups.phoneNumbers(phoneNumber).fetch();
  } catch (e) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }

  try {
    const result = await documentClient.scan({
      TableName: context['PHONE_PROVISIONING_TABLE'],
    }).promise();
    const items = result ? result.Items : [];

    const preCheck = items.filter(x => x.phoneNumber === phoneNumber);

    if (preCheck.length === 0) {
      const item = await documentClient.put({
        TableName: context['PHONE_PROVISIONING_TABLE'],
        Item: {
          Id: uuidv4(),
          Name: name,
          PhoneNumber: phoneNumber,
          EnableForward: enableForward,
          ForwardNumber: forwardNumber,
          WorkspaceSid: workspaceSid,
          Timeout: timeout,
          Priority: priority,
          TaskChannel: taskChannel,
          WorkflowSid: workflowSid,
          Type: type,
          QueueSid: queueSid,
          WorkerSid: workerSid,
          Source: phoneSource,
        },
      }).promise();
      return callback(null, utils.response('json', item));
    } else {
      return callback(null, utils.response('json', {
        error: 'Phone Exist',
      }));
    }
  } catch (e) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};