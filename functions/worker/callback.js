let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);

exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();

    const {
        workerSid,
        enable,
    } = event;

    try {
        let worker = await client.taskrouter.workspaces(
            context['TWILIO_WORKSPACE_SID']).workers(workerSid).fetch();

        const attributes = JSON.parse(worker.attributes);

        attributes.callback = enable;

        worker = await client.taskrouter.workspaces(
            context['TWILIO_WORKSPACE_SID']).
        workers(workerSid).
        update({attributes: JSON.stringify(attributes)});

        return callback(
            null,
            utils.response('json', {
                worker,
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