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
    id,
    emailList,
  } = event;

  try {
    const params = {
      TableName: context['VOICEMAIL_CALLBACK_CONFIGURATIONS_TABLE'],
      Key: {
        Id: id.toString(),
      },
      UpdateExpression: 'set ' +
          '#EmailList = :EmailList',
      ExpressionAttributeNames: {
        '#EmailList': 'EmailList',
      },
      ExpressionAttributeValues: {
        ':EmailList': emailList,
      },
    };

    const item = await documentClient.update(params).promise();

    return callback(null, utils.response('json', item));
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