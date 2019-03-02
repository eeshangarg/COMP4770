import * as Assets from './Assets.js';

const ctx = document.getElementById('gameCanvas').getContext('2d');
const socket = new WebSocket('ws://localhost:3000');
let inputQueue = [];
let loadingInterval = null;


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

function SocketHandler() {

    socket.onmessage = function(message) {

        let data = JSON.parse(message.data);
        if (data.t === 'd'){
            renderFrame(data.d);
        }

        // TODO add more message types here... Sounds, ect.

        emitInput();

    }

}

function renderFrame(data) {
    // Clear the canvas.
    ctx.clearRect(0, 0, 1024, 576);

    // Draw all stream animations.
    for (var i = 0; i < data.length; i++) {
        let sprite = Assets.get_Sprite(data[i].n);
        sprite.draw(data[i].x, data[i].y, data[i].f);
    }
}


// key up event.
document.onkeydown = function(event) {
    if (event.keyCode === 87)
        queueInput('w', '1');
    else if (event.keyCode === 65)
        queueInput('a', '1');
    else if (event.keyCode === 83)
        queueInput('s', '1');
    else if (event.keyCode === 68)
        queueInput('d', '1');
}

// Key Down events. 
document.onkeyup = function(event) {
    if (event.keyCode === 87)
        queueInput('w', '0');
    else if (event.keyCode === 65)
        queueInput('a', '0');
    else if (event.keyCode === 83)
        queueInput('s', '0');
    else if (event.keyCode === 68)
        queueInput('d', '0');
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

// TODO Frame buffering.