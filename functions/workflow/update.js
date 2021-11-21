let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  const {
    workflowSid,
    friendlyName,
    configuration,
    assignmentCallbackUrl,
    fallbackAssignmentCallbackUrl,
    taskReservationTimeout,
  } = event;

  try {
    const workflow = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
        workflows(workflowSid).
        update({
          friendlyName,
          configuration,
          assignmentCallbackUrl,
          fallbackAssignmentCallbackUrl,
          taskReservationTimeout,
        });

    return callback(null, utils.response('json', workflow));
  } catch (e) {
    console.error(e);
    return callback(
        null,
        utils.response('text', {
          e,
        }),
    );
  }
};