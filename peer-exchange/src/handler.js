const Client = require('./models/client');

function createMessageHandler(channels, client) {

    return function handleMessage(message) {
        console.log('Message received', message);
        const data = JSON.parse(message);

        const channel = channels.get(data.channelId, client);
    }
}

module.exports = {
    createMessageHandler,
};
