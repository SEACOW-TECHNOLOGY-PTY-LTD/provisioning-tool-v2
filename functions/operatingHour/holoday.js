let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
    const Holidays = require('date-holidays-parser');

    try {
        const hd = new Holidays('AU', 'NSW');

        console.log(hd.isHoliday(new Date()))

        return callback(null, utils.response('json', {
            isHoliday: hd.isHoliday(new Date()),
        }));
    } catch (e) {
        return callback(null, utils.response('json', {
            error: e,
        }));
    }
};