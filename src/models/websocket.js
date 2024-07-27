const io = require('socket.io-client');
// const MicrophoneStream = require('microphone-stream').default;

const socket = io('http://localhost:42033'); // Replace with your server URL

// Connect to the socketio server
socket.on('connect', () => {
    console.log('Connected to server');
});

// Disconnect from the socketio server
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// Subscribe to a channel
function subscribeToChannel(channel) {
    socket.emit('subscribe', { channel });
}

// Publish a message to a channel
function publishToChannel(channel, message) {
    socket.emit('publish', { channel, message }); 
}

export default function startMicrophoneStream() {
    try {
        // Request access to the microphone
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            // Access the audio stream
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            // console.log('Microphone stream started:', source);
            // Now you can use the source for further processing, 
            // like playing it back or analyzing it.
            })
        .catch(error => {
            // Handle errors like permission denied
            console.error('Error accessing microphone:', error);
            });
    } catch (err) {
        console.error('Error accessing microphone:', err);
    }
};

