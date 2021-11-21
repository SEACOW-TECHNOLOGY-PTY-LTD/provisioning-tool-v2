let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  try {
    const workers = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).workers.list();

    return callback(
        null,
        utils.response('json', {
          workers,
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