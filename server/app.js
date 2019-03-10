/* istanbul ignore file */
const express = require('express');
const app = express();
const server = require('http').Server(app);
const path = require('path');
const serverPort = 2000;
const socketPort = 3000;

// Send the Index page to the client via express.
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/../../client/index.html'));

});

// Sent the /client/ dir as a static express directory. 
app.use('/client', express.static(__dirname + '/../../client'));

// Listen the HTTP server.
server.listen(serverPort);
console.log("Server listening on localhost:2000")
// Create a WebSocketServer -> wws. Listen on port 3000.
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({
    port: socketPort,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 8,
            level: 5
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        serverMaxWindowBits: 15,
        concurrencyLimit: 10,
        threshold: 1
    },

    clientTracking: true,


});

// Declare the require helper methods.
const loadAnimations = require('./../rendering/Rendering.js').loadAnimations;
const initIO = require('./IOHandler.js').initIO;

console.log('Server Listening on port: ' + serverPort);
console.log('Socketing Listening on port: ' + socketPort);

// Load the Animation config file.
loadAnimations(__dirname + "/../../config/Animation.json");


// Intialize the Websocket server.
initIO(wss);
