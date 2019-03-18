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
let log = 'Server Listening at: http://localhost:' + serverPort;
console.log('\x1b[36m%s\x1b[0m', log);

// Create a WebSocketServer -> wws. Listen on port 3000.
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({
    port: socketPort,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 6,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        serverMaxWindowBits: 11,
        concurrencyLimit: 10,
        threshold: 1024
    },
    clientTracking: true,
});

log = "Websocket-server Listening on port:"  + socketPort + "  (for the client-side Websocket.)";
console.log('\x1b[33m%s\x1b[0m',log);

// Declare the require helper methods.
const initIO = require('./IOHandler.js').initIO;


// Intialize the Websocket server.
initIO(wss);