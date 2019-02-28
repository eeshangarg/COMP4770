const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = 2000;
const loadAnimations = require('./../Animator.js').loadAnimations;
const IO_init = require('./../IO_Handler.js').IO_init;
const path = require('path');
const socketClusterServer = require('socketcluster-server');
const scServer = socketClusterServer.attach(server);

// Send the Index page to the user
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/../../../client/index.html'));
});

// Set up a static express file server.
app.use('/client', express.static(__dirname + '/../../../client'));

// Start the server listening
server.listen(port);

console.log('Server Listening on port: ' + port);
const fileName = __dirname + "/../../../cfg/Animation.json";
loadAnimations(fileName);
IO_init(scServer);