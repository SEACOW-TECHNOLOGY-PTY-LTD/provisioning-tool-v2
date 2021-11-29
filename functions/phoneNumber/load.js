let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  try {
    const incomingPhoneNumbers = await client.incomingPhoneNumbers.list(
        {limit: 20});

    return callback(null, utils.response('json', incomingPhoneNumbers));
  } catch (e) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};