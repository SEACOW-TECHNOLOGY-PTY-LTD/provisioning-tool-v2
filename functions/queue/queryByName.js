let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  const {
    name,
  } = event;

  try {
    const queues = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
    taskQueues.list();

    let result = queues.filter(queue => queue.friendlyName === name);
    result = result.length > 0 ? result[0] : {};

    return callback(null, utils.response('json', {queue: result}));
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