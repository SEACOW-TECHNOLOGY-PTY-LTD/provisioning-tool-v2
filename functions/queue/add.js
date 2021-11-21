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

  const {
    assignmentActivitySid = 'WA6c79f737c96f1b30ff31bf5b135fcf75',
    reservationActivitySid = 'WA6c79f737c96f1b30ff31bf5b135fcf75',
    targetWorkers = '1 != 1',
    taskOrder = 'FIFO',
    friendlyName,
    type,
    enableVoicemail = false,
    enableVoicemailEmail = false,
    enableCallback = false,
    enableCallbackEmail = false,
    maxReservedWorkers = 1,
  } = event;

  console.log('1');
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

    const item = await documentClient.put({
      TableName: context['VOICEMAIL_CALLBACK_CONFIGURATIONS_TABLE'],
      Item: {
        Id: uuidv4(),
        Sid: queue.sid,
        Type: type,
        EnableVoicemail: enableVoicemail,
        EnableVoicemailEmail: enableVoicemailEmail,
        EnableCallback: enableCallback,
        EnableCallbackEmail: enableCallbackEmail,
        EmailList: [],
      },
    }).promise();

    console.log(queue);
    return callback(
        null,
        utils.response('json', {
          item,
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