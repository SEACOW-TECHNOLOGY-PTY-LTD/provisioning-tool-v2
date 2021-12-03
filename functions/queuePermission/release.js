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

  console.log(queueSid, skillId);

  let items = [];

  try {
    const result = await documentClient.scan({
      TableName: context['QUEUE_PROVISIONING_TABLE'],
    }).promise();

    if (result && result.Items.length > 0) {
      result.Items.forEach(elem => {
        if (queueSid === elem.QueueSid && skillId !== elem.SkillId) {
          items.push(elem);
        }
      });
    }

    await documentClient.delete({
      TableName: context['QUEUE_PROVISIONING_TABLE'],
      Key: {
        QueueSid: queueSid,
        SkillId: skillId,
      },
    }).promise();
  } catch (e) {
    console.log(`error1: ${e}`);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }

  try {
    let targetWorkers = '1 != 1';
    if (items.length > 0) {
      console.log(items);
      const result = await documentClient.scan({
        TableName: context['SKILL_TABLE'],
      }).promise();
      const skills = result.Items;

      items.forEach(elem => {
        const skill = skills.filter(x => x.Id === elem.SkillId)[0];
        if (skill) {
          targetWorkers += ` or skills HAS "${skill.name}"`;
        }
      });

      console.log(targetWorkers);

      const queue = await client.taskrouter.workspaces(
          context['TWILIO_WORKSPACE_SID']).
      taskQueues(queueSid).
      update({
        targetWorkers,
      });

      return callback(null, utils.response('json', queue));
    } else {
      const queue = await client.taskrouter.workspaces(
          context['TWILIO_WORKSPACE_SID']).
      taskQueues(queueSid).
      update({
        targetWorkers: '1 != 1',
      });

      return callback(null, utils.response('json', queue));
    }
  } catch (e) {
    console.log(`error2: ${e}`);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};