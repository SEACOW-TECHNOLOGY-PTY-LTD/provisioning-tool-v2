let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  const {
    friendlyName,
    configuration = {},
    assignmentCallbackUrl = '',
    fallbackAssignmentCallbackUrl = '',
    taskReservationTimeout = 120,
  } = event;

  try {
    const workflow = client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).workflows.create({
      assignmentCallbackUrl: assignmentCallbackUrl,
      fallbackAssignmentCallbackUrl: fallbackAssignmentCallbackUrl,
      friendlyName: friendlyName,
      configuration: JSON.stringify(configuration),
      taskReservationTimeout: taskReservationTimeout,
    });

    console.log(workflow);
    return callback(
        null,
        utils.response('json', {
          workflow,
        }),
    );
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