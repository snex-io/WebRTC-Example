export async function createPeerExchange(address) {
    const socket = new WebSocket(address);
    const listeners = new Set();

    function onMessage(message) {
        const data = JSON.parse(message.data);
        listeners.forEach(callback => callback(data));
    }

    function listen(callback) {
        listeners.add(callback);
    }

    function send(data) {
        socket.send(JSON.stringify(data));
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
}
