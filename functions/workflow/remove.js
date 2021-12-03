let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  const {
    workflowSid,
  } = event;

  try {
    await client.taskrouter.workspaces(context['TWILIO_WORKSPACE_SID']).
    workflows(workflowSid).
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