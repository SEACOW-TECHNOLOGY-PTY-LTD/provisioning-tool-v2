let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
  const moment = require('moment');
  require('moment-holiday-australia');

  const {
    current = new Date(),
  } = event;

  try {
    return callback(null, utils.response('json', {
      isHoliday: moment(current).isOnAustralianHoliday(),
    }));
  } catch (e) {
    return callback(null, utils.response('json', {
      error: e,
    }));
  }
};