import { createClient } from './websocket.js';
import { createPeerExchange } from './peer-exchange.js';

var peerConnection;
var serverConnection;

async function pageReady() {
    const localVideo = document.querySelector("#localVideo");

    const constraints = {
        video: true,
        audio: true,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = stream;

    const server = await createClient('wss://' + window.location.hostname + ':8443');
    const peerExchange = createPeerExchange(server);
    peerExchange.onConnection(conn => {
        console.log("New Connection", conn);

        conn.addEventListener("addstream", event => {
            console.log('Stream', event);
            const videoElement = document.createElement('video');
            videoElement.srcObject = event.stream;
            document.querySeletor('.streams').appendChild(videoElement);
        });

        conn.addStream(stream);
    });

    //console.log(peerExchange);
    peerExchange.extendOffer();
}

pageReady();
