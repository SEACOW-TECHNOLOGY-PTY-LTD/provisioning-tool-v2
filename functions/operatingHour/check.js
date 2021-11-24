let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
const AWS = require('aws-sdk');
const moment = require('moment-timezone');
const momentTimezone = require('moment-timezone');

exports.handler = async function(context, event, callback) {
  AWS.config.update({
    accessKeyId: context['AWS_ACCESS_KEY_ID'],
    secretAccessKey: context['AWS_SECRET_ACCESS_KEY'],
    region: context['AWS_REGION'],
  });

  const documentClient = new AWS.DynamoDB.DocumentClient();

  const {
    label,
  } = event;
  try {
    const result = await documentClient.query({
      TableName: context['OPERATING_HOUR_TABLE'],
      KeyConditionExpression: 'Label = :Label',
      ExpressionAttributeValues: {
        ':Label': label,
      },
    }).promise();

    let item;

    if (result.Items && result.Items.length > 0) {
      item = result.Items[0].Content;
    }

    // lib
    const momentTimezone = require('moment-timezone');
    const moment = require('moment');
    // 24 hour time format
    const timeFormat = 'HH:mm:ss';

    // vars
    const timezone = event.timezone || 'Australia/Sydney';
    const callTime = momentTimezone().tz(timezone).format(timeFormat);

    const current = moment(callTime, timeFormat); // convert to moment obj so we can use built in query functions
    const dayOfWeek = momentTimezone().tz(timezone).format('d');

    if (item[`${dayOfWeek}`]) {
      const openObj = item[`${dayOfWeek}`].open;
      const closeObj = item[`${dayOfWeek}`].close;
      const status = item[`${dayOfWeek}`].status;

      // boundaries
      const opening = moment(
          `${openObj.hour}:${openObj.minutes}:${openObj.seconds}`, timeFormat); // 08:00:00
      const closing = moment(
          `${closeObj.hour}:${closeObj.minutes}:${closeObj.seconds}`,
          timeFormat); // 17:29:59

      if (status.includes('close')) {
        return callback(null, utils.response('json', {
          isOpen: false,
          opening,
          closing,
          current,
        }));
      }

      return callback(null, utils.response('json', {
        isOpen: current.isBetween(opening, closing),
        opening,
        closing,
        current,
      }));
    }
  } catch (e) {
    console.log(e);
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};