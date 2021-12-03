let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();

    const {
        queueSid,
    } = event;

    try {
        const queue = await client.taskrouter.workspaces(
            context['TWILIO_WORKSPACE_SID']).
        taskQueues(queueSid).
        fetch();

        return callback(null, utils.response('json', {queue}));
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