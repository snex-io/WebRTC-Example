import { dataChannelConfig, peerConnectionConfig } from './config.js';
import { createPeerExchange } from './peer-exchange.js';
import { createPeer } from './peer.js';

var localVideo;
var localStream;
var remoteVideo;
var peerConnection;
var serverConnection;
var dataChannel;

function pageReady() {
    document.querySelector("button#start")
    .addEventListener("click", extendOffer);

    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    serverConnection = createPeerExchange('wss://' + window.location.hostname + ':8443');
    serverConnection.listen(gotMessageFromServer);

    setup();
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.srcObject = stream;
}

function setup() {
    peerConnection = createPeer(null, peerConnectionConfig);

    peerConnection.addEventListener('icecandidate', gotIceCandidate);
    peerConnection.addEventListener('addstream', gotRemoteStream);

    if(navigator.mediaDevices.getUserMedia) {
        var constraints = {
            video: true,
            audio: true,
        };

        navigator.mediaDevices.getUserMedia(constraints)
        .then(getUserMediaSuccess)
        .then(() => {
            peerConnection.addStream(localStream);
        })
        .catch(errorHandler);
    } else {
        alert('Your browser does not support getUserMedia API');
    }

    peerConnection.addEventListener('datachannel', function(dataChannel) {
        dataChannel.channel.send('Hello there, I got your signal');
    });

    dataChannel = peerConnection.createDataChannel("myLabel", dataChannelConfig);
    dataChannel.addEventListener('error', function (error) {
      console.log("Data Channel Error:", error);
    });

    dataChannel.addEventListener('message', function (event) {
      console.log("Got Data Channel Message:", event.data);
    });

    dataChannel.addEventListener('open', function (event) {
        console.log("Datachannel open", event);
    });

    dataChannel.addEventListener('close', function () {
      console.log("The Data Channel is Closed");
    });
}

function extendOffer() {
    peerConnection.createOffer().then(createdDescription).catch(errorHandler);
}

function gotMessageFromServer(signal) {
    if(signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
            // Only create answers in response to offers
            if(signal.sdp.type == 'offer') {
                peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
            }
        }).catch(errorHandler);
    } else if(signal.ice) {
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    }
}

function gotIceCandidate(event) {
    if(event.candidate != null) {
        serverConnection.send({'ice': event.candidate});
    }
}

function createdDescription(description) {
    console.log('got description');

    peerConnection.setLocalDescription(description).then(function() {
        serverConnection.send({'sdp': peerConnection.localDescription});
    }).catch(errorHandler);
}

function gotRemoteStream(event) {
    console.log('got remote stream');
    remoteVideo.srcObject = event.stream;
}

function errorHandler(error) {
    console.log(error);
}

pageReady();
