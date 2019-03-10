import {
    loadFromFile,
    allSpritesLoaded,
    getSprite
} from './Assets.js';

const bgCanvas = document.getElementById('bgCanvas').getContext('2d')
const gameCanvas = document.getElementById('gameCanvas').getContext('2d');
const textCanvas = document.getElementById('textCanvas').getContext('2d');
let textStrings = {};

document.fonts.load('10pt "PS2P"');
document.fonts.load('10pt "pixeled"');




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

    loadFromFile('/client/Assets.json');

    loadingInterval = setInterval(function() {
        if (allSpritesLoaded()) {
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
            renderFrame(data.d, data.p);
        } else if (data.t == 'b') {
            setGradient(data.c1, data.c2);
        } else if (data.t == 't') {
            drawText(data.s, data.f, data.k, data.p[0], data.p[1]);
        } else if (data.t == 'c') {
            clearText(data.k);
        } else if (data.t === 'a') {
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

// The function which handles clearing textStrings.
function clearText(key) {
    // If the text strings has the key, remove it.
    if (textStrings.hasOwnProperty(key)) {
        delete textStrings[key];

        // Redraw all text strings.
        textCanvas.clearRect(0, 0, 1024, 576);
        let keys = Object.keys(textStrings);        
        for (let i = 0; i < keys.length; i++) {
            let textString = textStrings[keys[i]];
            textCanvas.font = textString.font;
            textCanvas.fillText(textString.string, textString.dx, textString.dy);
        }
    } else {
        console.log("No textString to delete at key : " + key);
    }
}


function drawText(textString, font, key, dx, dy) {

    textStrings[key] = {
        string: textString,
        font: font,
        dx: dx,
        dy: dy
    };

    textCanvas.clearRect(0, 0, 1024, 576);
    let keys = Object.keys(textStrings);
    for (let i = 0; i < keys.length; i++) {
        let textString = textStrings[keys[i]];
        textCanvas.font = textString.font;
        textCanvas.fillText(textString.string, textString.dx, textString.dy);
    }
}

function setGradient(color1, color2) {
    let gradient = bgCanvas.createLinearGradient(512, 0, 512, 576);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    bgCanvas.fillStyle = gradient;
    bgCanvas.fillRect(0, 0, 1024, 576);
}


function loadIdMap(data) {
    for (let i = 0; i < data.length; i++) {
        animIdMap.set(data[i].id, data[i].name);
    }
}


function renderFrame(data, playerPos) {

    // Clear the canvas.
    gameCanvas.clearRect(0, 0, 1024, 576);

    playerPos[0] -= 487;
    playerPos[1] -= 263;

    // Draw all streamed animations from server.
    for (let i = 0; i < data.length; i++) {
        let sprite = getSprite(animIdMap.get(data[i].n));
        if (data[i].hasOwnProperty('f')) {
            sprite.draw(data[i].d[0] - playerPos[0], data[i].d[1] - playerPos[1], data[i].f);
        } else {
            sprite.draw(data[i].d[0] - playerPos[0], data[i].d[1] - playerPos[1], 0);
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
    else if (event.keyCode === 32)
        queueInput('_', 1);
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
    else if (event.keyCode === 32)
        queueInput('_', 0);
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