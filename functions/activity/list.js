let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();

    try {
        const activities = await client.taskrouter.workspaces(
            context['TWILIO_WORKSPACE_SID']).activities.list();

        return callback(
            null,
            utils.response('json', {
                activities,
            }),
        );
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