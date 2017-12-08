import { dataChannelConfig, peerConnectionConfig } from './config.js';
import { createPeerExchange } from './peer-exchange.js';
import { createPeer } from './peer.js';

var peerConnection;
var serverConnection;

async function pageReady() {
    document.querySelector("button#start")
    .addEventListener("click", extendOffer);

    serverConnection = await createPeerExchange('wss://' + window.location.hostname + ':8443');

    setup();
}

async function setup() {
    var constraints = {
        video: true,
        audio: true,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    document.getElementById('localVideo').srcObject = stream;

    peerConnection = createPeer(serverConnection, peerConnectionConfig);

    peerConnection.addEventListener('addstream', stream => {
        document.getElementById('remoteVideo').srcObject = event.stream;
    });

    peerConnection.addStream(stream);
}

function extendOffer() {
    console.log('Extending offer');
    peerConnection.createOffer().then(createdDescription).catch(errorHandler);
}

function createdDescription(description) {
    console.log('got description');

    peerConnection.setLocalDescription(description).then(function() {
        serverConnection.send({'sdp': peerConnection.localDescription});
    }).catch(errorHandler);
}

function errorHandler(error) {
    console.log(error);
}

pageReady();
