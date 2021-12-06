let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
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
    name,
    phoneNumber,
    type,
    workerSid,
    timeout = 84000,
    priority = 10,
    taskChannel = 'voice',
  } = event;

  let queueSid = '';
  let workflowSid = '';

  try {
    let queues = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).taskQueues.list();

    queues.forEach(queue => {
      if (queue.friendlyName === 'Personal') {
        queueSid = queue.sid;
      }
    });

    let workflows = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).workflows.list();

    workflows.forEach(workflow => {
      if (workflow.friendlyName === 'Assign To Personal') {
        workflowSid = workflow.sid;
      }
    });
  } catch (err) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }

  try {
    const params = {
      TableName: context['PHONE_PROVISIONING_TABLE'],
      Key: {
        Id: Id,
      },
      UpdateExpression: 'set ' +
          '#name = :name, ' +
          '#phoneNumber = :phoneNumber, ' +
          '#workspaceSid = :workspaceSid, ' +
          '#timeout = :timeout, ' +
          '#priority = :priority, ' +
          '#taskChannel = :taskChannel, ' +
          '#workflowSid = :workflowSid, ' +
          '#type = :type, ' +
          '#queueSid = :queueSid, ' +
          '#workerSid = :workerSid',
      ExpressionAttributeNames: {
        '#name': 'Name',
        '#phoneNumber': 'PhoneNumber',
        '#workspaceSid': 'WorkspaceSid',
        '#timeout': 'Timeout',
        '#priority': 'Priority',
        '#taskChannel': 'TaskChannel',
        '#workflowSid': 'WorkflowSid',
        '#type': 'Type',
        '#queueSid': 'QueueSid',
        '#workerSid': 'WorkerSid',
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':phoneNumber': phoneNumber,
        ':workspaceSid': context['TWILIO_WORKSPACE_SID'],
        ':timeout': timeout,
        ':priority': priority,
        ':taskChannel': taskChannel,
        ':workflowSid': workflowSid,
        ':type': type,
        ':queueSid': queueSid,
        ':workerSid': workerSid,
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