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

    let newSkills = [];

    const result = await documentClient.scan({
      TableName: context['SKILL_TABLE'],
    }).promise();
    const skills = result.Items;
    if (skills.length > 0) {
      const skill = skills.filter(x => x.Id === skillId)[0];
      if (skill) {
        if (attributes['skills']) {
          if (attributes['skills'].length > 0) {
            attributes['skills'].forEach(item => {
              if (item !== skill.name) {
                newSkills.push(item);
              }
            });
          }
        }
      }
    }

    attributes['skills'] = newSkills;

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
    await documentClient.delete({
      TableName: context['AGENT_PROVISIONING_TABLE'],
      Key: {
        WorkerSid: workerSid,
        SkillId: skillId,
      },
    }).promise();

    return callback(null, utils.response('json', {
      result: 'success',
    }));
  } catch (e) {
    console.log(`error3: ${e}`);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};