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

  const {
    Id,
    name,
    min,
    max,
    note,
  } = event;

  try {
    const params = {
      TableName: context['SKILL_TABLE'],
      Key: {
        Id: Id,
      },
      UpdateExpression: 'set #name = :name, ' +
          '#min = :min, ' +
          '#max = :max, ' +
          '#note = :note',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#min': 'min',
        '#max': 'max',
        '#note': 'note',
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':min': min,
        ':max': max,
        ':note': note,
      },
    };

    const item = await documentClient.update(params).promise();

    return callback(null, utils.response('json', item));
  } catch (e) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};