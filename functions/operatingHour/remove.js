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

    const {
        Id,
    } = event;
    const params = {
        TableName: context['PHONE_PROVISIONING_TABLE'],
        Key: {
            Id: Id,
        },
    };

    try {
        await documentClient.delete(params).promise();

        return callback(null, utils.response('json', {
            result: 'Success',
        }));
    } catch (e) {
        return callback(null, utils.response('json', {
            result: 'Failed',
            error: e,
        }));
    }
};