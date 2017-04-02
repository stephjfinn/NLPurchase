const { Wit, log } = require('node-wit');

exports.client = function () {
    return new Wit({
        accessToken: process.env.WIT_ACCESS_TOKEN,
        actions: {
            send(request, response) {
                return new Promise(function (resolve, reject) {
                    console.log(JSON.stringify(response));
                    return resolve();
                });
            },

            myAction({ sessionId, context, text, entities }) {
                console.log(`Session ${sessionId} received ${text}`);
                console.log(`The current context is ${JSON.stringify(context)}`);
                console.log(`Wit extracted ${JSON.stringify(entities)}`);
                return Promise.resolve(context);
            }
        },
        logger: new log.Logger(log.DEBUG) // optional
    });
}