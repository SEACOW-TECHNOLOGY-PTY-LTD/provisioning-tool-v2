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

  try {
    const result = await documentClient.scan({
      TableName: context['QUEUE_PROVISIONING_TABLE'],
    }).promise();

    const skills = await documentClient.scan({
      TableName: context['SKILL_TABLE'],
    }).promise();

    const queues = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
    taskQueues.list();

    const items = [];

    if (result && result.Items.length > 0) {
      result.Items.forEach(elem => {
        items.push({
          queueSid: elem.QueueSid,
          skillId: elem.SkillId,
          queueName: queues.filter(
              x => x.sid === elem.QueueSid).length > 0 ? queues.filter(
              x => x.sid === elem.QueueSid)[0].friendlyName : 'unknown',
          skillName: skills && skills.Items.length > 0 ? skills.Items.filter(
              x => x.Id === elem.SkillId).length > 0 ? skills.Items.filter(
              x => x.Id === elem.SkillId)[0].name : 'unknown' : 'unknown',
        });
      });
    }

    return callback(null, utils.response('json', items));
  } catch (e) {
    console.log(e);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};