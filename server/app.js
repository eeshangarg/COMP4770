/* istanbul ignore file */
const express = require('express');
const app = express();
const server = require('http').Server(app);
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const path = require('path');
const serverPort = 2000;
const socketPort = 3000;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'gameDatabase';

// Use connect method to connect to the server
MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
    assert.equal(null, err);

    console.log("Successfull connection of Node.js server to server Mongod.");

    // Load "dbname" as the data base.
    const db = client.db(dbName);

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
        perMessageDeflate: true,
        clientTracking: true,
    });

    log = "Websocket-server Listening on port:" + socketPort + "  (for the client-side Websocket.)";
    console.log('\x1b[33m%s\x1b[0m', log);

    // Declare the require helper methods.
    const initIO = require('./IOHandler.js').initIO;


    // Intialize the Websocket server.
    initIO(wss, db);
});