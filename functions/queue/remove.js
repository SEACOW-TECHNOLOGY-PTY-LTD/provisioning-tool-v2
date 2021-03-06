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
    queueSid,
    queueName,
  } = event;

  let workflowSid = '';

  try {
    const workflows = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).workflows.list();

    const workflow = workflows.filter(
        x => x.friendlyName === `Assign To ${queueName}`);

    if (workflow.length > 0) {
      workflowSid = workflow[0].sid;
    }
  } catch (e) {
    console.error(e);
    return callback(null, utils.response('json', {
      result: 'Failed',
      error: e,
    }));
  }

  try {
    await client.taskrouter.workspaces(context['TWILIO_WORKSPACE_SID']).
        workflows(workflowSid).remove();
  } catch (e) {
    console.error(e);
    return callback(null, utils.response('json', {
      result: 'Failed',
      error: e,
    }));
  }

  try {
    await client.taskrouter.workspaces(context['TWILIO_WORKSPACE_SID']).
        taskQueues(queueSid).
        remove();

    const result = await documentClient.scan({
      TableName: context['VOICEMAIL_CALLBACK_CONFIGURATIONS_TABLE'],
    }).promise();
    const items = result ? result.Items : [];

    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].Sid === queueSid) {
          const params = {
            TableName: context['VOICEMAIL_CALLBACK_CONFIGURATIONS_TABLE'],
            Key: {
              Id: items[i].Id,
            },
          };

          await documentClient.delete(params).promise();
        }
      }
    }

    return callback(null, utils.response('json', {
      result: 'Success',
    }));
  } catch (e) {
    console.error(e);
    return callback(null, utils.response('json', {
      result: 'Failed',
      error: e,
    }));
  }
};