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
  console.log(1)

  const client = context.getTwilioClient();

  try {
    const result = await documentClient.scan({
      TableName: context['AGENT_PROVISIONING_TABLE'],
    }).promise();
    console.log(2)

    const skills = await documentClient.scan({
      TableName: context['SKILL_TABLE'],
    }).promise();
    console.log(skills)

    const workers = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
    workers.list();
    console.log(4)

    const items = [];

    if (result && result.Items.length > 0) {
      result.Items.forEach(elem => {
        const attributes = JSON.parse(workers.filter(
            x => x.sid === elem.WorkerSid)[0]['attributes']);
        const skillName = skills && skills.Items.length > 0
            ? skills.Items.filter(
                x => x.Id === elem.SkillId) > 0 ? skills.Items.filter(
            x => x.Id === elem.SkillId)[0].name
            : 'unknown' : 'unknown';
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
    console.log(e)
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};