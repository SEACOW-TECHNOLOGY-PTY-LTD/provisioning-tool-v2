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

    Object.keys(event).forEach(elem=> {
        console.log(`${elem} - ${event[`${elem}`]}`)
    })

    const {
        Type,
        Content
    } = event;
    try {
        const result = await documentClient.update({
            TableName: context['SYSTEM_SETTINGS_TABLE'],
            Key: {Type: Type},
            UpdateExpression: 'SET #Content = :Content',
            ExpressionAttributeNames: {
                '#Content': 'Content',
            },
            ExpressionAttributeValues: {
                ':Content': Content,
            },
            ReturnConsumedCapacity: 'TOTAL',
            ReturnItemCollectionMetrics: 'SIZE',
            ReturnValues: 'ALL_NEW',
        }).promise();
        console.log(result)

        return callback(null, utils.response('json', {
            config : result.Attributes
        }));
    } catch (e) {
        console.log(e);
        return callback(null, utils.response('json', {
            error: e,
        }));
    }
};