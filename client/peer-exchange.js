import { createClient } from './websocket.js';
import { dataChannelConfig, peerConnectionConfig } from './config.js';

export function createPeerExchange(client) {

    const listeners = new Set();
    const connections = new Set();

    function onConnection(callback) {
        listeners.add(callback);
    }

    client.listen(async signal => {
        if (signal.sdp) {
            console.log('Signal', signal);
            if(signal.sdp.type == 'offer') {
                const conn = await createConnection(signal.sdp);
                listeners.forEach(callback => callback(conn));
                connections.add(conn);
            }
        } else if (signal.ice) {
            connections.forEach(conn => {
                const iceCandidate = new RTCIceCandidate(signal.ice);
                conn.addIceCandidate(iceCandidate)
            });
        }
    });

    async function createConnection(sdp) {
        const conn = new RTCPeerConnection(peerConnectionConfig);

        const remoteDesc = new RTCSessionDescription(sdp);
        await conn.setRemoteDescription(remoteDesc);

        const localDesc = await conn.createAnswer();
        await conn.setLocalDescription(localDesc);

        client.send({sdp: localDesc});

        conn.addEventListener('icecandidate', event => {
            console.log('iceCandidate', event);
            if(event.candidate != null) {
                client.send({ice: event.candidate});
            }
        });

        return conn;
    }

    async function extendOffer() {
        const conn = new RTCPeerConnection(peerConnectionConfig);
        const localDesc = await conn.createOffer();
        await conn.setLocalDescription(localDesc);
        client.send({sdp: localDesc});
    }

    return {
        onConnection,
        extendOffer,
    };
}
