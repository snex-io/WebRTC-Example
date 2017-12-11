import { peerConnectionConfig } from './config.js';
import { createUUID } from './random.js';

function errorHandler(error) {
    console.error(error);
}

const Types = {
    ANNOUNCE: 'announce',
    ANSWER: 'answer',
    OFFER: 'offer',
};

export function createHost(peerExchange, channelId) {
    const listeners = new Set();

    function onConnection(callback) {
        listeners.add(callback);
    }

    function emitConnection(conn) {
        listeners.forEach(callback => callback(conn));
    }

    peerExchange.listen(async signal => {
        console.log("Host signal", signal);
        if (signal.sdp && signal.sdp.type === Types.OFFER) {
            const {conn, send} = createConn(peerExchange, channelId);

            emitConnection(conn);

            const remoteDesc = new RTCSessionDescription(signal.sdp);
            conn.setRemoteDescription(remoteDesc).catch(errorHandler);

            const localDesc = await conn.createAnswer();
            conn.setLocalDescription(localDesc).catch(errorHandler);

            send({sdp: localDesc});
        }
    });

    return {
        onConnection,
    };
}

export function createGuest(peerExchange, channelId) {
    const {conn, onSignal, send} = createConn(peerExchange, channelId);

    onSignal(signal => {
        console.log("Guest signal", signal);
        if (signal.sdp && signal.sdp.type === Types.ANSWER) {
            const remoteDesc = new RTCSessionDescription(signal.sdp);
            conn.setRemoteDescription(remoteDesc).catch(errorHandler);
        }
    });

    async function connect() {
        const localDesc = await conn.createOffer();
        conn.setLocalDescription(localDesc).catch(errorHandler);
        send({sdp: localDesc});
    }

    return {
        conn,
        connect,
    };
}

let id = 0;

export function createConn(peerExchange, channelId) {
    console.log("CREATE CONN");

    const conn = new RTCPeerConnection(peerConnectionConfig);
    const connId = id++;

    function onSignal(callback) {
        listeners.add(callback);
    }

    function send(data) {
        peerExchange.send(Object.assign({}, data, {channelId, connId}));
    }

    conn.addEventListener('icecandidate', event => {
        if(event.candidate != null) {
            send({ice: event.candidate});
        }
    });

    const listeners = new Set();

    peerExchange.listen(signal => {
        listeners.forEach(callback => callback(signal));
    });

    onSignal(signal => {
        console.log('Us / Them', connId, signal.connId);

        if(signal.ice) {
            const iceCandidate = new RTCIceCandidate(signal.ice);
            conn.addIceCandidate(iceCandidate).catch(error => {
                errorHandler(error);
                console.log(signal.ice);
            });
        }
    });

    send({type: Types.ANNOUNCE});

    return {
        conn,
        onSignal,
        send,
    };
}
