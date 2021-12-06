exports.handler = function (context, event, callback) {
    const response = new Twilio.Response();
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (typeof event.phone === "undefined") {
        response.setBody({
            success: false,
            error: "Missing parameter; please provide a phone number.",
        });
        response.setStatusCode(400);
        return callback(null, response);
    }

    const client = context.getTwilioClient();

    client.lookups
        .phoneNumbers(event.phone)
        .fetch()
        .then((resp) => {
            response.setStatusCode(200);
            response.setBody({
                success: true,
            });
            callback(null, response);
        })
        .catch((error) => {
            console.log(error);
            response.setStatusCode(200);
            response.setBody({
                success: false,
                error: error.message,
            });
            callback(null, response);
        });
};
