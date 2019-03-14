/* istanbul ignore file */

// The map which connected sockets tied to a ID.
let socketMap = new Map();

// Requires
const GameEngine = require('./../ecs/GameEngine.js');
const shortid = require('shortid');
const {
    loadAnimations
} = require('./../rendering/Rendering.js');

// the function to intialize IO-helpers for websockets, should be passed the WebSocket-Server.
function initIO(wss) {

    // Load the Animation config file.
    loadAnimations(__dirname + "/../../config/Animation.json");

    console.log('IO Initialzied for WebSocket-Server.');

    // On a client socketing in, create handle for client websocket "ws".
    wss.on('connection', (ws) => {

        // Generate a socket ID to refer to the current socket connection.
        ws.id = shortid.generate();

        // Push the given ID into the socket map.
        socketMap.set(ws.id, ws);

        console.log('socket $ connected, ID: ', ws.id, " Client Count: ", wss.clients.size);

        ws.on('message', (data) => {
            if (data === 'all assests loaded') {
                const getAnimationIDMap = require('./../rendering/Rendering.js').getAnimationIDMap;
                const animIdMap = JSON.stringify({
                    t: 'a',
                    d: getAnimationIDMap()
                });
                ws.send(animIdMap);
                IOHandler(ws);
            }
        });

        ws.on('close', function close() {
            console.log('socket closed, ID: ', ws.id, " Client Count: ", wss.clients.size);
            ws.GameEngine.quit();
            socketMap.delete(ws.id);
        });

    });

}


// The function which handles IO for a given Web-socket. 
function IOHandler(ws) {

    // Clear the file loading listener.
    ws.removeAllListeners('message');
    // Create a instance of a fakeGameEngine passed the socket.

    let game = new GameEngine(ws);
    game.init();
    ws.GameEngine = game;
    ws.on('message', (message) => {

        let data = JSON.parse(message);
        // Data.t, Type: 'i' -> Input. 
        if (data.t === 'i') {
            let map = ws.GameEngine.getInputMap();
            let inputMap = updateInputData(data.d, map);
            ws.GameEngine.setInputMap(inputMap);
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
function emitFrame(ws, renderQueue, px, py) {

    if (ws.readyState == 1) {

        //send draw call 'd' -> Draw.
        let message = {
            t: 'd',
            p: [px, py],
            d: renderQueue
        };

        ws.send(JSON.stringify(message));
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
        } else if (data[i].k === '|') {
            map.enter = state;
        }

    }
    return map;
}


// Declare Exports.
module.exports = {
    'initIO': initIO,
    'emitFrame': emitFrame,
    'setBackground': setBackground,
    'drawText': drawText,
    'clearText': clearText
};