'use strict';

const _ = require('lodash')
const AWS = require('aws-sdk')

async function getUserAttributes(event) {

    console.info('Validando acesso', 'getUserAttributes->user')

    const cognito = new AWS.CognitoIdentityServiceProvider({
        apiVersion: '2016-04-18',
        region: process.env.COGNITO_USER_POOL_REGION,
    })

    const IDP_REGEX = /.*\/.*,(.*)\/(.*):CognitoSignIn:(.*)/
    const authProvider = event.requestContext.identity.cognitoAuthenticationProvider
    const [, , , userSub] = authProvider.match(IDP_REGEX)

    console.info('getUserAttributes->adminGetUser', {
        "userPoolId": process.env.COGNITO_USER_POOL_ID,
        "userSub": userSub,
    })

    const user = await cognito.adminGetUser({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: userSub
    }).promise()

    console.debug('getUserAttributes->user', typeof user, user)

    if (user === null || !user.Enabled || user.UserStatus !== 'CONFIRMED') {
        throw new Error(`Usuário inválido: ${userSub}`);
    }

    // console.info('getUserAttributes->user', 'Usuário validado no COGNITO')

    const payload = {}
    await _.map(user.UserAttributes, (v) => (payload[v.Name] = v.Value))

    return payload
}

module.exports.getUserAttributes = getUserAttributes
