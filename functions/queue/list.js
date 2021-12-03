let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
const AWS = require('aws-sdk');

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  AWS.config.update({
    accessKeyId: context['AWS_ACCESS_KEY_ID'],
    secretAccessKey: context['AWS_SECRET_ACCESS_KEY'],
    region: context['AWS_REGION'],
  });

  const documentClient = new AWS.DynamoDB.DocumentClient();

  try {
    const queues = await client.taskrouter.workspaces(
        context['TWILIO_WORKSPACE_SID']).
    taskQueues.list();

    const result = await documentClient.scan({
      TableName: context['VOICEMAIL_CALLBACK_CONFIGURATIONS_TABLE'],
    }).promise();
    const items = result ? result.Items : [];

    const resp = [];
    if (queues.length > 0) {
      queues.forEach(queue => {
        const item = queue;
        const tmp = items.filter(x => x.Sid === queue.sid);
        if (tmp && tmp.length > 0) {
          item.enableVoicemail = tmp[0].EnableVoicemail || false;
          item.enableVoicemailEmail = tmp[0].EnableVoicemailEmail || false;
          item.enableCallback = tmp[0].EnableCallback || false;
          item.enableCallbackEmail = tmp[0].EnableCallbackEmail || false;
          item.emailList = tmp[0].EmailList || [];
          item.type = tmp[0].Type;
          item.id = tmp[0].Id;
        } else {
          item.enableVoicemail = false;
          item.enableVoicemailEmail = false;
          item.enableCallback = false;
          item.enableCallbackEmail = false;
          item.emailList = [];
          item.type = '';
          item.id = '';
        }
        resp.push(item);
      });
    }

    console.log(queues);
    return callback(null, utils.response('json', {queues: resp}));
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