const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = 2000;
const IO_init = require('./../IO_Handler.js').IO_init;
const loadAnimations = require('./../Animator.js').loadAnimations;
const path = require('path');

// Send the Index page to the user
app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '/../../../client/index.html'));
});

// Set up a static express file server.
app.use('/client', express.static(__dirname + '/../../../client'));

// Start the server listening
server.listen(port);

console.log('Server Listening on port: ' + port);
var file = __dirname + "/../../../cfg/Animation.json";
loadAnimations(file);
IO_init(server);