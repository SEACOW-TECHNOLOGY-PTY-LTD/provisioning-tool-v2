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
  } = event;

  let workflowSid = '';

  try {
    const workflows = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).workflows.list();

    const workflow = workflows.filter(
        x => x.friendlyName === `Assign To Personal`);

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