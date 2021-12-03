let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
    const date = new Date()
    const curYear = date.getFullYear()
    const curMonth = date.getMonth() + 1
    const curDate = date.getDate()

    let holidayList = {
        2021: {
            1 : [1, 31, 2],
            2 : [3],
            12: [2]
        },
        2022: {
            3 : [1, 31, 2],
            4 : [5],
            12: [4]
        }
    }

    let isHoliday = holidayList[curYear][curMonth].includes(curDate)

    try {
        return callback(null, utils.response('json', {
            isHoliday: isHoliday
        }));
    } catch (e) {
        console.log(e);
        return callback(null, utils.response('json', {
            error: e,
        }));
    }
};