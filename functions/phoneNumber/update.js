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
    Id,
    name,
    phoneNumber,
    workspaceSid,
    timeout,
    priority,
    taskChannel,
    workflowSid,
    type,
    queueSid = '',
    workerSid = '',
  } = event;

  try {
    if (workerSid) {
      let worker = await client.taskrouter.workspaces(
          context['TWILIO_WORKSPACE_SID']).workers(workerSid).fetch();

      const attributes = JSON.parse(worker.attributes);
      attributes.phone = phoneNumber;

      await client.taskrouter.workspaces(
          context['TWILIO_WORKSPACE_SID']).workers(workerSid)
          .update({attributes: JSON.stringify(attributes)});
    }

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
        ':workspaceSid': workspaceSid,
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
    console.log(e)
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};