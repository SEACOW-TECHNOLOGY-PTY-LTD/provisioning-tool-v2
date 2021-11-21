let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  const {
    name,
  } = event;

  try {
    const workflows = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).workflows.list();

    let result = workflows.filter(workflow => workflow.friendlyName === name);
    result = result.length > 0 ? result[0] : {};

    return callback(null, utils.response('json', {workflow: result}));
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