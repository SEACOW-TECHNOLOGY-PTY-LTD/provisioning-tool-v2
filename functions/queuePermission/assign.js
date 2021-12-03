let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
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
    queueSid,
    skillId,
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

    const result = await documentClient.scan({
      TableName: context['SKILL_TABLE'],
    }).promise();
    const skills = result.Items;
    if (skills.length > 0) {
      const skill = skills.filter(x => x.Id === skillId)[0];
      if (skill) {
        targetWorkers += ` or skills HAS "${skill.name}"`;
      }
    }

    await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
    taskQueues(queueSid).
    update({
      targetWorkers,
    });
  } catch (e) {
    console.log(`error2: ${e}`);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }

  try {
    const result = await documentClient.scan({
      TableName: context['QUEUE_PROVISIONING_TABLE'],
    }).promise();
    const items = result ? result.Items : [];

    const preCheck = items.filter(
        x => x.queueSid === queueSid && x.skillId === skillId);

    if (preCheck.length === 0) {
      const item = await documentClient.put({
        TableName: context['QUEUE_PROVISIONING_TABLE'],
        Item: {
          QueueSid: queueSid,
          SkillId: skillId,
        },
      }).promise();

      return callback(null, utils.response('json', item));
    } else {
      return callback(null, utils.response('json', {
        error: 'Phone Exist',
      }));
    }
  } catch (e) {
    console.log(`error3: ${e}`);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};