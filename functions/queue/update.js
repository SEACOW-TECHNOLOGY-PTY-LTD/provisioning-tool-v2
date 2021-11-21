let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
const AWS = require('aws-sdk');

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  AWS.config.update({
    accessKeyId: context['AWS_ACCESS_KEY_ID'],
    secretAccessKey: context['AWS_SECRET_ACCESS_KEY'],
    region: context['AWS_REGION'],
  });

  const documentClient = new AWS.DynamoDB.DocumentClient();

  const {
    queueSid,
    assignmentActivitySid,
    reservationActivitySid,
    targetWorkers,
    taskOrder,
    friendlyName,
    maxReservedWorkers,
    type,
    enableVoicemail = false,
    enableVoicemailEmail = false,
    enableCallback = false,
    enableCallbackEmail = false,
    id,
  } = event;

  try {
    const queue = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
        taskQueues(queueSid).
        update({
          assignmentActivitySid,
          reservationActivitySid,
          targetWorkers,
          friendlyName,
          taskOrder,
          maxReservedWorkers,
        });

    const params = {
      TableName: context['VOICEMAIL_CALLBACK_CONFIGURATIONS_TABLE'],
      Key: {
        Id: id,
      },
      UpdateExpression: 'set ' +
          '#Type = :Type, ' +
          '#EnableVoicemail = :EnableVoicemail, ' +
          '#EnableVoicemailEmail = :EnableVoicemailEmail, ' +
          '#EnableCallback = :EnableCallback, ' +
          '#EnableCallbackEmail = :EnableCallbackEmail',
      ExpressionAttributeNames: {
        '#Type': 'Type',
        '#EnableVoicemail': 'EnableVoicemail',
        '#EnableVoicemailEmail': 'EnableVoicemailEmail',
        '#EnableCallback': 'EnableCallback',
        '#EnableCallbackEmail': 'EnableCallbackEmail',
      },
      ExpressionAttributeValues: {
        ':Type': type,
        ':EnableVoicemail': enableVoicemail,
        ':EnableVoicemailEmail': enableVoicemailEmail,
        ':EnableCallback': enableCallback,
        ':EnableCallbackEmail': enableCallbackEmail,
      },
    };

    const item = await documentClient.update(params).promise();

    return callback(null, utils.response('json', queue));
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