let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  try {
    const workflows = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).workflows.list();

    console.log(workflows);
    return callback(null, utils.response('json', {workflows}));
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