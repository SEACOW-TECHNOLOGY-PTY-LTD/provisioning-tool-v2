let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  const {
    queueSid,
  } = event;

  let queue;

  try {
    queue = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
    taskQueues(queueSid).
    fetch();

    if (!queue) {
      return callback(null, utils.response('json', {
        error: 'Queue Not Found',
      }));
    }
  } catch (e) {
    console.log(`error1: ${e}`);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }

  try {
    let targetWorkers = queue.targetWorkers;

    if (targetWorkers.includes('1 == 1')) {
      console.log('disable');
      targetWorkers = targetWorkers.replace(' or 1 == 1', '');
    } else {
      console.log('enable');
      targetWorkers += ` or 1 == 1`;
    }

    const result = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
    taskQueues(queueSid).
    update({
      targetWorkers,
    });

    return callback(null, utils.response('json', result));
  } catch (e) {
    console.log(`error2: ${e}`);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};