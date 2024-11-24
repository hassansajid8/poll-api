const { io } = require('socket.io-client')

const socket = io('http://localhost:3000');

// Join a poll room
const pollId = '44f755c8-c1c0-42e9-a1bd-69ae96571efb'; // Replace with your poll ID
socket.emit('join_poll', pollId);

// Listen for real-time poll updates
socket.on('poll_update', (results) => {
    console.log('Updated Poll Results:', results);
});
