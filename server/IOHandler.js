/* istanbul ignore file */

// Global varriables.
let renderQueue = [];
let socketMap = new Map();
let id = 0;

// Requires
const fakeGameEngine = require('./fake_ECS.js').fakeGameEngine;
const shortid = require('shortid');

// The function to "Queue" an Animation. Only used by the Animator.
function queueAnimation(id, frame, dx, dy) {
    if (frame == -1){
        renderQueue.push({
            n: id,
            d: [dx,dy]
        });
    }
    else {
        renderQueue.push({
            n: id,
            d: [dx,dy],
            f: frame
        });
    }
}



module.exports.queueAnimation = queueAnimation;

// Intialize the IO helpers.
function initIO(wss) {

    console.log('IO Initialzied'); 

    // On a client socketing in :
    wss.on('connection', (ws) => {

        // Generate a socket ID.
        ws.id = shortid.generate();
        socketMap.set(ws.id, ws);

        console.log('socket connected, ID: ', ws.id, " Client Count: ", wss.clients.size);

        let getAnimationIDMap = require('./../rendering/Rendering.js').getAnimationIDMap;
        let animIdMap = JSON.stringify({t:'a', d:getAnimationIDMap()});

        ws.on('message', function incoming(data) { 
            if (data === 'all assests loaded') {
                ws.send(animIdMap);
                IOHandler(ws);
            }
        });

        ws.on('close', function close() {
            console.log('socket closed, ID: ', ws.id, " Client Count: ", wss.clients.size);
            socketMap.delete(ws.id);
        });

    });

}

function IOHandler(ws) {

    // Clear the file loading listener.
    ws.removeAllListeners('message');
    // Create a instance of a fakeGameEngine passed the socket.

    let gameEngine = fakeGameEngine(ws);
    let getInputMap = require('./fake_ECS.js').getInputMap;
    let setInputMap = require('./fake_ECS.js').setInputMap;

    ws.on('message', function incoming(message) {

        let data = JSON.parse(message);
        if (data.t === 'i') {
            let map = getInputMap();
            let inputMap = updateInputData(data.d, map);
            setInputMap(inputMap);
        }

        /* 
        TODO add more message types here... Sounds, ect.
            i.e: 
                else if (data.t === 'l') {
                    saveLevel(data.d);
                } ... 
        */

    });
}


// The function which emits a frame through a Websocket.
function emitFrame(ws) {

    if (ws.readyState == 1) {

        //send draw call 'd' -> Draw.
        let message = {
            t: 'd',
            d: renderQueue
        };

        ws.send(JSON.stringify(message));
        renderQueue = [];
    }

}


// The function to handle input data.
// This is to be passed parsed data.
function updateInputData(data, map) {

    let inputMap = map; 

    for (var i = 0; i < data.length; i++) {

        // Resolve the state of the input.
        let state = true;
        if (data[i].s === 0) {
            state = false;
        }

        if (data[i].k === 'w') {
            inputMap.w = state;
        } else if (data[i].k === 'a') {
            inputMap.a = state;
        } else if (data[i].k === 's') {
            inputMap.s = state;
        } else if (data[i].k === 'd') {
            inputMap.d = state;
        }
    }

    return inputMap;
}


module.exports.initIO = initIO;
module.exports.emitFrame = emitFrame;