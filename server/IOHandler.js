/* istanbul ignore file */

// Global varriables.
let renderQueue = [];
let socketMap = new Map();
let id = 0;

// Requires
const fakeGameEngine = require('./fake_ECS.js').fakeGameEngine;
const shortid = require('shortid');


// The function to "Queue" an Animation. Only used by Rendering.
function queueAnimation(id, frame, dx, dy) {
    if (frame == -1) {
        renderQueue.push({
            n: id,
            d: [dx, dy]
        });
    } else {
        renderQueue.push({
            n: id,
            d: [dx, dy],
            f: frame
        });
    }
}


module.exports.queueAnimation = queueAnimation;


// Intialize the IO helpers for websockets, is to be passed the WebSocekt-Server.
function initIO(wss) {

    console.log('IO Initialzied');

    // On a client socketing in :
    wss.on('connection', (ws) => {

        // Generate a socket ID.
        ws.id = shortid.generate();
        socketMap.set(ws.id, ws);

        console.log('socket $ connected, ID: ', ws.id, " Client Count: ", wss.clients.size);

        let getAnimationIDMap = require('./../rendering/Rendering.js').getAnimationIDMap;
        let animIdMap = JSON.stringify({
            t: 'a',
            d: getAnimationIDMap()
        });

        ws.on('message', (data) => {
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


// The function which handles IO for a given Web-socket. 
function IOHandler(ws) {

    // Clear the file loading listener.
    ws.removeAllListeners('message');
    // Create a instance of a fakeGameEngine passed the socket.

    let gameEngine = fakeGameEngine(ws);
    let getInputMap = require('./fake_ECS.js').getInputMap;
    let setInputMap = require('./fake_ECS.js').setInputMap;

    ws.on('message', (message) => {

        let data = JSON.parse(message);
        // Data.t, Type: 'i' -> Input. 
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

// The function which handles setting text strings.
function drawText(ws, textString, key, font, color, dx, dy) {
    if (ws.readyState == 1) {
        let message = {
            t: 't',
            k: key,
            s: textString,
            f: font,
            c: color,
            p: [dx, dy]
        };

        ws.send(JSON.stringify(message));
    }
}


// The function which handles clearing text Strings.
function clearText(ws, key) {
    if (ws.readyState == 1) {
        let message = {
            t: 'c',
            k: key,
        };

        ws.send(JSON.stringify(message));
    }

}
// The function which emits a frame through a Websocket.
function emitFrame(ws, px, py) {

    if (ws.readyState == 1) {

        //send draw call 'd' -> Draw.
        let message = {
            t: 'd',
            p: [px, py],
            d: renderQueue
        };

        ws.send(JSON.stringify(message));
        renderQueue = [];
    }

}


// The function that handles background changing.
function setBackground(ws, c1, c2) {
    if (ws.readyState == 1) {
        let message = {
            t: 'b',
            c1: c1,
            c2: c2
        }

        ws.send(JSON.stringify(message));
    }
}


// The function to handle inputData, Sets inputs to Map then returns the map.
function updateInputData(data, map) {

    for (var i = 0; i < data.length; i++) {

        // Resolve the state of the input optmistically.
        let state = true;
        if (data[i].s === 0) {
            state = false;
        }

        // Key state input block.
        if (data[i].k === 'w') {
            map.w = state;
        } else if (data[i].k === 'a') {
            map.a = state;
        } else if (data[i].k === 's') {
            map.s = state;
        } else if (data[i].k === 'd') {
            map.d = state;
        } else if (data[i].k === '_') {
            map.space = state;
        }
    }
    return map;
}


// Declare Exports.
module.exports = {
    'queueAnimation': queueAnimation,
    'initIO': initIO,
    'emitFrame': emitFrame,
    'setBackground': setBackground,
    'drawText': drawText,
    'clearText' : clearText
};