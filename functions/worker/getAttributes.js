let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  const {
    workerSid,
  } = event;

  try {
    const worker = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
        workers(workerSid).
        fetch();
    const attributes = JSON.parse(worker.attributes);

    return callback(
        null,
        utils.response('json', {
          attributes,
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