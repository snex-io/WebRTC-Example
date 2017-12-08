import { dataChannelConfig, peerConnectionConfig } from './config.js';
import { createClient } from './websocket.js';
import { createPeerExchange } from './peer-exchange.js';

var peerConnection;
var serverConnection;

async function pageReady() {
    const peerExchange = createPeerExchange(await createClient('wss://' + window.location.hostname + ':8443'));
    peerExchange.onConnection(conn => {
        console.log(conn);
    });

    console.log(peerExchange);
    peerExchange.extendOffer();
}

pageReady();
