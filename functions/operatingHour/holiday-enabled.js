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
        type,
    } = event;
    try {
        const result = await documentClient.query({
            TableName: context['SYSTEM_SETTINGS_TABLE'],
            KeyConditionExpression: '#Type = :Type',
            ExpressionAttributeNames: {
                '#Type': 'Type',
            },
            ExpressionAttributeValues: {
                ':Type': type,
            },
        }).promise();

        console.log("tar:", result)

        return callback(null, utils.response('json', {
            config : result['Items'][0]
        }));
    } catch (e) {
        console.log(e);
        return callback(null, utils.response('json', {
            error: e,
        }));
    }
};