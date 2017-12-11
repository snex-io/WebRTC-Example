import { createPeer } from './peer.js';

var peerConnection;
var serverConnection;

async function pageReady() {
    document.querySelector("button#host")
    .addEventListener("click", host);

    document.querySelector("button#connect")
    .addEventListener("click", connect);
}

async function host() {
    const peer = await createPeer('a0vm912umvj012');

    peer.onConnection(conn => {
        console.log("Host Received Connection", conn);

        conn.addEventListener('addstream', stream => {
            console.log("Host received stream", stream);
            document.getElementById('remoteVideo').srcObject = event.stream;
        });
    });
    console.log("Host waiting for connections");
}

async function connect() {
    var constraints = {
        video: true,
        audio: true,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    const peer = await createPeer('a0vm912umvj012');
    peer.conn.addStream(stream);

    console.log("Connecting");
    peer.connect();
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
