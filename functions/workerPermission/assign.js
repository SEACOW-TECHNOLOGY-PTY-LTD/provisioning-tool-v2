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
    workerSid,
    skillId,
    level,
  } = event;

  let worker;
  try {
    worker = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
        workers(workerSid).
        fetch();

    if (!worker) {
      return callback(null, utils.response('json', {
        error: 'Worker Not Found',
      }));
    }
  } catch (e) {
    console.log(`error1: ${e}`);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }

  try {
    let attributes = JSON.parse(worker.attributes);

    const result = await documentClient.scan({
      TableName: context['SKILL_TABLE'],
    }).promise();

    const skills = result.Items;
    if (skills.length > 0) {
      const skill = skills.filter(x => x.Id === skillId)[0];
      if (skill) {
        if (!attributes['skills']) {
          attributes['skills'] = [];
        }
        if (!attributes['skills'].includes(skill.name)) {
          attributes['skills'].push(skill.name);
          if (attributes.levels)
            attributes.levels[`${skill.name.replace(/ /g, '_')}`] = level;
          else {
            attributes.levels = {};
            attributes.levels[`${skill.name.replace(/ /g, '_')}`] = level;
          }
        }
      }
    }

    await client.taskrouter.workspaces(context['TWILIO_WORKSPACE_SID']).
        workers(workerSid).
        update({attributes: JSON.stringify(attributes)});
  } catch (e) {
    console.log(`error2: ${e}`);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }

  try {
    const result = await documentClient.scan({
      TableName: context['AGENT_PROVISIONING_TABLE'],
    }).promise();
    const items = result ? result.Items : [];

    const preCheck = items.filter(
        x => x.workerSid === workerSid && x.skillId === skillId);

    if (preCheck.length === 0) {
      const item = await documentClient.put({
        TableName: context['AGENT_PROVISIONING_TABLE'],
        Item: {
          WorkerSid: workerSid,
          SkillId: skillId,
          Level: level,
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