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

  const {
    name,
    min = 0,
    max = 0,
    note = '',
  } = event;

  try {
    const result = await documentClient.scan({
      TableName: context['SKILL_TABLE'],
    }).promise();
    const items = result ? result.Items : [];

    const preCheck = items.filter(x => x.name === name);

    if (preCheck.length === 0) {
      const item = await documentClient.put({
        TableName: context['SKILL_TABLE'],
        Item: {
          Id: uuidv4(),
          name,
          min,
          max,
          note,
        },
      }).promise();

      return callback(null, utils.response('json', item));
    } else {
      return callback(null, utils.response('json', {
        error: 'Skill Exist',
      }));
    }
  } catch (e) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};