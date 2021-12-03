let path = Runtime.getFunctions()['utils'].path;
let utils = require(path);
const {v4: uuidv4} = require('uuid');
const AWS = require('aws-sdk');

exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();

    AWS.config.update({
        accessKeyId: context['AWS_ACCESS_KEY_ID'],
        secretAccessKey: context['AWS_SECRET_ACCESS_KEY'],
        region: context['AWS_REGION'],
    });

    const documentClient = new AWS.DynamoDB.DocumentClient();

    const {
        firstName,
        lastName,
        email,
        phone,
        company = 'default',
        department = 'default',
    } = event;

    try {
        const result = await documentClient.scan({
            TableName: context['CONTACT_DIRECTORY_TABLE'],
        }).promise();
        const items = result ? result.Items : [];

        const preCheck = items.filter(x => x.content === content);

        if (preCheck.length === 0) {
            const item = await documentClient.put({
                TableName: context['CONTACT_DIRECTORY_TABLE'],
                Item: {
                    Id: uuidv4(),
                    FirstName: firstName,
                    LastName: lastName,
                    Email: email,
                    Phone: phone,
                    Company: company,
                    Department: department,
                },
            }).promise();

            return callback(null, utils.response('json', item));
        } else {
            return callback(null, utils.response('json', {
                error: 'Phone Exist',
            }));
        }
    } catch (e) {
        return callback(null, utils.response('json', {
            error: e,
        }));
    }
};