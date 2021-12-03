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
        firstName,
        lastName,
        email,
        phone,
        company,
        department,
    } = event;

    try {
        const params = {
            TableName: context['CONTACT_DIRECTORY_TABLE'],
            Key: {
                Id: Id,
            },
            UpdateExpression: 'set ' +
                '#firstName = :firstName, ' +
                '#lastName = :lastName, ' +
                '#email = :email, ' +
                '#phone = :phone, ' +
                '#company = :company, ' +
                '#department = :department',
            ExpressionAttributeNames: {
                '#firstName': 'FirstName',
                '#lastName': 'LastName',
                '#email': 'Email',
                '#phone': 'Phone',
                '#company': 'Company',
                '#department': 'Department'
            },
            ExpressionAttributeValues: {
                ':firstName': firstName,
                ':lastName': lastName,
                ':email': email,
                ':phone': phone,
                ':company': company,
                ':department': department
            },
        };

        const item = await documentClient.update(params).promise();

        return callback(null, utils.response('json', item));
    } catch (e) {
        return callback(null, utils.response('json', {
            error: e,
        }));
    }
};