let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
const {v4: uuidv4} = require('uuid');
const AWS = require('aws-sdk');

exports.handler = async function(context, event, callback) {
  AWS.config.update({
    accessKeyId: context['AWS_ACCESS_KEY_ID'],
    secretAccessKey: context['AWS_SECRET_ACCESS_KEY'],
    region: context['AWS_REGION'],
  });

  const documentClient = new AWS.DynamoDB.DocumentClient();

  const client = context.getTwilioClient();

  const assignmentActivitySid = 'WA6c79f737c96f1b30ff31bf5b135fcf75';
  const reservationActivitySid = 'WA6c79f737c96f1b30ff31bf5b135fcf75';
  const targetWorkers = '1 == 1';
  const taskOrder = 'FIFO';
  const friendlyName = 'Personal';
  const maxReservedWorkers = 1;

  try {
    const queue = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
        taskQueues.
        create({
          assignmentActivitySid: assignmentActivitySid,
          reservationActivitySid: reservationActivitySid,
          targetWorkers: targetWorkers,
          friendlyName: friendlyName,
          taskOrder: taskOrder,
        });

    const queueUpdate = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
        taskQueues(queue.sid).
        update({
          maxReservedWorkers,
        });

    const workflow = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).workflows.create({
      friendlyName: `Assign To ${friendlyName}`,
      configuration: JSON.stringify({
        task_routing: {
          filters: [
            {
              'filter_friendly_name': 'Find Target Agent',
              expression: '1==1',
              targets: [
                {
                  queue: queue.sid,
                  priority: 10,
                  expression: 'task.targetAgent==worker.sid',
                },
              ],
            },
          ],
        },
      }),
    });

    console.log(queue);
    return callback(
        null,
        utils.response('json', {
          result: 'success',
        }),
    );
  } catch (error) {
    console.error(error);
    return callback(
        null,
        utils.response('json', {
          error,
        }),
    );
  }
};