import { createUUID } from './random.js';

export function createClient(address) {
    const uuid = createUUID();

    const socket = new WebSocket(address);
    const listeners = new Set();

    function onMessage(message) {
        const data = JSON.parse(message.data);

        if (data.uuid === uuid) {
            return;
        }

        listeners.forEach(callback => callback(data, send));
    }

    function listen(callback) {
        listeners.add(callback);
    }

    function send(data) {
        socket.send(JSON.stringify(Object.assign({uuid}, data)));
    }

    socket.addEventListener('message', onMessage);

    return new Promise(resolve => {
        socket.addEventListener('open', () => {
            resolve({
                listen,
                send,
            });
        });
    });
};
