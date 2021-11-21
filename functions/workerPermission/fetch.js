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
      TableName: context['AGENT_PROVISIONING_TABLE'],
    }).promise();

    const skills = await documentClient.scan({
      TableName: context['SKILL_TABLE'],
    }).promise();

    const workers = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
        workers.list();

    const items = [];

    if (result && result.Items.length > 0) {
      result.Items.forEach(elem => {
        const attributes = JSON.parse(workers.filter(
            x => x.sid === elem.WorkerSid)[0]['attributes']);
        const skillName = skills && skills.Items.length > 0
            ? skills.Items.filter(
                x => x.Id === elem.SkillId)[0].name
            : 'unknown';
        items.push({
          workerSid: elem.WorkerSid,
          skillId: elem.SkillId,
          workerName: attributes['full_name'],
          skillName: skillName,
          level: attributes.levels ? attributes.levels[`${skillName.replace(
              / /g, '_')}`]
              ? attributes.levels[`${skillName.replace(/ /g, '_')}`]
              : 0 : 0,
        });
      });
    }

    return callback(null, utils.response('json', items));
  } catch (e) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};