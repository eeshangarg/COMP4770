import * as Assets from './Assets.js';

const ctx = document.getElementById('gameCanvas').getContext('2d');
const socket = new WebSocket('ws://localhost:3000'); // A localHost socket.
//const socket = new WebSocket('ws://149.248.56.80:3000'); // A socket to the VPS.
let inputQueue = [];
let loadingInterval = null;
let animIdMap = new Map();

// Kill socket
window.onbeforeunload = function() {
    socket.close();
};

socket.onopen = function() {

    console.log('Socket Opened Sucessfully! Waiting for Assets...');

    Assets.load_from_file('/client/Assets.json');

    loadingInterval = setInterval(function() {
        if (Assets.all_Sprite_Loaded()) {
            socket.send('all assests loaded');
            SocketHandler();
            clearInterval(loadingInterval);
        }
    }, 10);
};

// This function handles sendinhg / receiving messages.
function SocketHandler() {

    socket.onmessage = function(message) {

        let data = JSON.parse(message.data);

        if (data.t === 'd') {
            renderFrame(data.d);
        }
        else if (data.t === 'a') {
            loadIdMap(data.d);
        }

        /* TODO add more message types here... Sounds, ect.
           i.e: 
            else if (data.t === 's') {
                playSound(data.d);
            }
        */

        emitInput();

    }

}

function loadIdMap(data) {
    for (let i = 0; i < data.length; i++) {
        animIdMap.set(data[i].id, data[i].name);
    }
}

function renderFrame(data) {

    // Clear the canvas.
    ctx.clearRect(0, 0, 1024, 576);

    // Draw all streamed animations from server.
    for (var i = 0; i < data.length; i++) {
        let sprite = Assets.get_Sprite(animIdMap.get(data[i].n));
        if (data[i].hasOwnProperty('f')){
            sprite.draw(data[i].d[0], data[i].d[1], data[i].f);
        }
        else {
           sprite.draw(data[i].d[0], data[i].d[1], 0);
        }
        
    }
}


// key up event.
document.onkeydown = function(event) {
    if (event.keyCode === 87)
        queueInput('w', 1);
    else if (event.keyCode === 65)
        queueInput('a', 1);
    else if (event.keyCode === 83)
        queueInput('s', 1);
    else if (event.keyCode === 68)
        queueInput('d', 1);
}

// Key Down events. 
document.onkeyup = function(event) {
    if (event.keyCode === 87)
        queueInput('w', 0);
    else if (event.keyCode === 65)
        queueInput('a', 0);
    else if (event.keyCode === 83)
        queueInput('s', 0);
    else if (event.keyCode === 68)
        queueInput('d', 0);
}


function emitInput() {
    if (inputQueue.length != 0) {
        let message = {
            t: 'i',
            d: inputQueue
        };
        socket.send(JSON.stringify(message));
        inputQueue = [];
    }
}

function queueInput(key, state) {
    inputQueue.push({
        k: key,
        s: state
    });
}

// TODO Frame buffering?