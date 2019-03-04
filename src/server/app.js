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

// Create a WebSocketServer -> wws. Listen on port 3000.
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({
    port: socketPort,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        concurrencyLimit: 10,
        threshold: 0
    },
    clientTracking: true,


});

// Declare the require helper methods.
const loadAnimations = require('./../rendering/Animator.js').loadAnimations;
const IO_init = require('./IO_Handler.js').IO_init;

console.log('Server Listening on port: ' + serverPort);
console.log('Socketing Listening on port: ' + socketPort);

// Load the Animation config file.
loadAnimations(__dirname + "/../../cfg/Animation.json");


// Intialize the Websocket server.
IO_init(wss);