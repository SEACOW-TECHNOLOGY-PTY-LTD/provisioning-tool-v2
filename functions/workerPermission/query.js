let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
const AWS = require('aws-sdk');

exports.handler = async function(context, event, callback) {
    AWS.config.update({
        accessKeyId: context['AWS_ACCESS_KEY_ID'],
        secretAccessKey: context['AWS_SECRET_ACCESS_KEY'],
        region: context['AWS_REGION'],
    });
    const { skillId } = event

    const documentClient = new AWS.DynamoDB.DocumentClient();

    try {
        const result = await documentClient.scan({
            TableName: context['AGENT_PROVISIONING_TABLE'],
            FilterExpression: '#SkillId = :SkillId',
            ExpressionAttributeNames: {
                '#SkillId': 'SkillId',
            },
            ExpressionAttributeValues: {
                ':SkillId': skillId,
            },
            ScanIndexForward: false,
        }).promise();


        return callback(null, utils.response('json', result.Items));
    } catch (e) {
        console.log(e)
        return callback(null, utils.response('json', {
            error: e,
        }));
    }
};