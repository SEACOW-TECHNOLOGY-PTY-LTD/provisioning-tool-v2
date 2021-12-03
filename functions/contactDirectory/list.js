let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
const AWS = require('aws-sdk');

exports.handler = async function(context, event, callback) {
    AWS.config.update({
        accessKeyId: context['AWS_ACCESS_KEY_ID'],
        secretAccessKey: context['AWS_SECRET_ACCESS_KEY'],
        region: context['AWS_REGION'],
    });

    const documentClient = new AWS.DynamoDB.DocumentClient();

    try {
        const result = await documentClient.scan({
            TableName: context['CONTACT_DIRECTORY_TABLE'],
        }).promise();
        const items = result ? result.Items : [];

        return callback(null, utils.response('json', items));
    } catch (e) {
        return callback(null, utils.response('json', {
            error: e,
        }));
    }
};