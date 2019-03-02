/* istanbul ignore file */

// Global varriables.
let renderQueue = [];
let socketsMap = new Map();
let id = 0;

// Requires
const fakeGameEngine = require('./fake_ECS.js').fakeGameEngine;
const shortid = require('shortid');

// The function to "Queue" an Animation. Only used by the Animator.
function queueAnimation(SpriteName, frame, dx, dy) {
    renderQueue.push({
        n: SpriteName,
        f: frame,
        x: dx,
        y: dy
    });
}

module.exports.queueAnimation = queueAnimation;

// Intialize the IO helpers.
function IO_init(wss) {
    // On a client socketing in :
    wss.on('connection', (ws) => {

        // Generate a socket ID.
        ws.id = shortid.generate();
        socketsMap.set(ws.id, ws);

        console.log('socket connected, ID: ', ws.id, " Client Count: ", wss.clients.size);

        ws.on('message', function incoming(data) {
            if (data === 'all assests loaded') {
                IO_Handler(ws);
            }
        });

        ws.on('close', function close() {
            console.log('socket closed, ID: ', ws.id, " Client Count: ", wss.clients.size);
            socketsMap.delete(ws.id);
        });

    });

}

function IO_Handler(ws) {
    // Clear the file loading listener.
    ws.removeAllListeners('message');
    // Create a instance of a fakeGameEngine passed the socket.

    fakeGameEngine(ws);

    let updateInputData = require('./fake_ECS.js').updateInputData;

    ws.on('message', function incoming(message) {
        let data = JSON.parse(message);
        if (data.t === 'i') {
            updateInputData(data.d);
        }

        // TODO Add other message types here... Save, Load, ect.

    });
}



function emitFrame(ws) {

    //send draw call 'd' -> Draw.
    let message = {
        t: 'd',
        d: renderQueue
    };

    ws.send(JSON.stringify(message));
    renderQueue = [];
}


module.exports.IO_init = IO_init;
module.exports.emitFrame = emitFrame;