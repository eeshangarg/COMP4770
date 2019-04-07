// Import the required helper functions from Assets.js
import {
    loadFromFile,
    allSpritesLoaded,
    allSoundsLoaded,
    getSound,
    getSoundMap,
    getSprite
} from './Assets.js';


const keys = [-2,-1,71,67,87,65,83,46,81,68,82,89,85,84,61,69,13,32,27,37,39,38,49,50,51,52,53,16,17,187,189,78,73,66];
const bgCanvas = document.getElementById('bgCanvas').getContext('2d') // The background Canvas.
const gameCanvas = document.getElementById('gameCanvas').getContext('2d'); // The Game Canvas.
const textCanvas = document.getElementById('textCanvas').getContext('2d'); // The Text Canvas.
const rect = document.getElementById('gameCanvas').getBoundingClientRect();
const socket = new WebSocket('ws://localhost:3000'); // A localHost socket.
//const socket = new WebSocket('ws://149.248.56.80:3000'); // A socket to the VPS.
socket.binaryType = "arraybuffer";

let musicOn = true;
let inputEmitInterval = null;
let loadingInterval = null;
let loginInterval = null;
let animIdMap = new Map();
let textStrings = {};
let mousePos = {
    x: Infinity,
    y: Infinity
};

loadFromFile('/client/Assets.json');
document.fonts.load('10pt "PS2P"');
document.fonts.load('10pt "pixeled"');
document.fonts.load('10pt "Seagram"');

// Set all the button on-click listners.
document.getElementById("loginBtn").addEventListener("click", loginHandler);
document.getElementById("cancelBtn").addEventListener("click", cancleHandler);
document.getElementById("forgotPwdBtn").addEventListener("click", forgotMyPwdHanlder);
document.getElementById("createAccountBtn").addEventListener("click", newAccHandler);
document.getElementById("newAcceptBtn").addEventListener("click", newAcceptHandler);
document.getElementById("newCancelBtn").addEventListener("click", newCancleHandler);

/*
    Close socket if the page is reloaded. This is only required for some versions of
    browsers, however it is best practice to keep it in.
*/
window.onbeforeunload = function() {
    socket.close();
};

// When the socket is connected, report asset status to server. 
socket.onopen = function() {

    console.log('Socket Opened Sucessfully! Waiting for Assets...');

    loadingInterval = setInterval(function() {
        if (allSpritesLoaded() && allSoundsLoaded()) {
            let message = {
                t: 'load'
            };

            // Message the server informing that all assets have been loaded.
            socket.send(JSON.stringify(message));
            // Clear the asset listening interval.
            clearInterval(loadingInterval);
            loginInterval = setInterval(loginListner(), 100);

        }
    }, 100);
};

socket.onclose = function() {
    console.log('Socket Closing.');
    if (inputEmitInterval != null){
        clearInterval(inputEmitInterval);
    }
    if (loadingInterval != null){
        clearInterval(loadingInterval);
    }
    if (loginInterval != null){
        clearInterval(loginInterval);
    }
}

// This function handles login-listening
function loginListner() {
    socket.onmessage = function(message) {

        let data = JSON.parse(message.data);
        // Type: 'l' -> Animation login-validation message.
        if (data.t === 'login') {
            if (data.valid == 1) {
                // Valid login create the socketHandler.
                document.getElementById('div_login').style.visibility = 'hidden';
                document.getElementById('div_new_acc').style.visibility = 'hidden';
                document.getElementById('div_game_div').style.visibility = 'visible';
                SocketHandler()
            } else {
                alert("Invalid Username / Password.");
            }
        }
        // Type: 'a' -> Animation ID-Map message.   
        else if (data.t === 'animMap') {
            loadIdMap(data.d);
        } else if (data.t === 'taken') {
            alert("Username already taken.");
        }
    }
}

// This function handles sending / receiving messages.
function SocketHandler() {
    // Add the event handler for mouse , movement.
    window.addEventListener('mousemove', updateMousePos, false);
    // key up event, que a input with state and key.

    document.onkeydown = function(event) {
        queueInput(event.keyCode, 1);
    }

    // key down event, que a input with state and key.
    document.onkeyup = function(event) {
        queueInput(event.keyCode, 0);
    }

    document.onmouseup = function(event) {
        queueInput(-2, 0);
    }

    document.onmousedown = function(event) {
        queueInput(-2, 1);
    }


    socket.onmessage = function(message) {
        let str = new TextDecoder('utf-8').decode(message.data);
        let data = JSON.parse(str);

        // The value of Data.t denotes the type of message.

        // Type: 'd' -> Game canvas draw message.
        if (data.t === 'd') {
            renderFrame(data.d, data.p);
        }
        // Type: 't' -> Draw Text-string message.
        else if (data.t == 't') {
            drawText(data.s, data.f, data.k, data.c, data.p[0], data.p[1]);
        }
        // Type : 's' -> Play-sound message.
        else if (data.t === 's') {
            playSound(data.s);
        }
        // Type: 'c' -> Clear Text-string message.
        else if (data.t === 'c') {
            clearText(data.k);
        }
        // Type: 'b' -> Background Image message. 
        else if (data.t === 'b') {
            setBackground(data.i);
        }
        // Type 'x' -> Stop Sound message.
        else if (data.t === 'x') {
            stopSound(data.s);
        }
        // Type: 'g' -> Background gradient message. 
        else if (data.t === 'g') {
            setGradient(data.c1, data.c2);
        }
        // Type: 'K' -> Save Levle message.
        else if (data.t === 'k') {
            alert(data.m);
        }
        else if (data.t === 'm') {
            musicOn = !musicOn;
        }

        /*
            TODO add more message types here... Sounds, ect.
               i.e: 
                else if (data.t === 's') {
                    playSound(data.d);
                }
        */

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
    } else if (key === 'all') {
        textCanvas.clearRect(0, 0, 1024, 576);
        textStrings = {};
    } else {
        console.log("No textString to delete at key : " + key);
    }
}


// The function which handles drawing text-strings associtated with a given key.
function drawText(textString, font, key, color, dx, dy) {

    // Set the textString key to the new value.
    textStrings[key] = {
        string: textString,
        font: font,
        color: color,
        dx: dx,
        dy: dy
    };

    textCanvas.clearRect(0, 0, 1024, 576);
    let keys = Object.keys(textStrings);
    for (let i = 0; i < keys.length; i++) {
        let textString = textStrings[keys[i]];
        textCanvas.font = textString.font;
        textCanvas.fillStyle = textString.color;
        textCanvas.fillText(textString.string, textString.dx, textString.dy);
    }
}

// the function to handle background image setting:
function setBackground(spriteName) {
    
    bgCanvas.clearRect(0, 0, 1024, 576);
    let sprite = getSprite(spriteName);
    bgCanvas.drawImage(sprite.image, 0, 0, 1024, 576, 0, 0, 1024, 576);
    if (musicOn) {
        if (spriteName === "bg_menu") {
            stopSound("bg");
            playSound("menu");
        } else if (spriteName === "bg_cave") {
            stopSound("bg");
            playSound("cave");
        } else if (spriteName === "bg_desrt") {
            stopSound("bg");
            playSound("desert");
        } else if (spriteName === "bg_green") {
            stopSound("bg");
            playSound("green");
        } else if (spriteName === "bg_snow") {
            stopSound("bg");
            playSound("frozen");
        } else if (spriteName === "bg_forest") {
            stopSound("bg");
            playSound("forest");
        }
    }
}


function playSound(soundName) {
    let sound = getSound(soundName);
    if (typeof sound !== 'undefined') {
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    } 
    else {
        console.log("Unknow sound : " + soundName);
    }

}


function stopSound(soundName) {
    if (soundName === 'all') {
        let soundmap = getSoundMap();
        soundmap.forEach(function(sound){
            if( sound != current ){
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }
    else if (soundName === 'bg') {
        let sound = getSound("menu");
        sound.pause();
        sound.currentTime = 0;
        sound = getSound("cave");
        sound.pause();
        sound.currentTime = 0;
        sound = getSound("desert");
        sound.pause();
        sound.currentTime = 0;
        sound = getSound("green");
        sound.pause();
        sound.currentTime = 0;
        sound = getSound("frozen");
        sound.pause();
        sound.currentTime = 0;
        sound = getSound("forest");
        sound.pause();
        sound.currentTime = 0;
    }
    else {
        let sound = getSound(soundName);
        sound.pause();
        sound.currentTime = 0;
    }

}


// The function which handles setting the background-gradient colors passed via message.
function setGradient(color1, color2) {
    let gradient = bgCanvas.createLinearGradient(512, 0, 512, 576);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    bgCanvas.fillStyle = gradient;
    bgCanvas.fillRect(0, 0, 1024, 576);
}


// The function which loads the SpriteName ID map passed via message.
function loadIdMap(data) {
    for (let i = 0; i < data.length; i++) {
        animIdMap.set(data[i].id, data[i].name);
    }
}


// The function which renders frame-data passed via message. Playerpos acts as the viewport.
function renderFrame(data, playerPos) {
    // Clear the gameCanvas canvas.
    gameCanvas.clearRect(0, 0, 1024, 576);

    // Draw all streamed animations from server.
    for (let i = 0; i < data.length; i++) {
        let sprite = getSprite(animIdMap.get(data[i][0]));
        if (typeof sprite !== "undefined") {
            if (data[i].length == 4) {
                // Draw all Dynamic-sprites corrected against the players Pos.
                sprite.draw(data[i][1] - playerPos[0], data[i][2] + playerPos[1], data[i][3]);
            } else {
                // Draw all static-sprites corrected against the players Pos.
                sprite.draw(data[i][1] - playerPos[0], data[i][2] + playerPos[1], 0);
            }
        }
        else {
            console.log("Cannot find Sprite:" + data[i][0]);
            let sprite = getSprite('error');
            sprite.draw(data[i][1] - playerPos[0], data[i][2] + playerPos[1], 0);
        }

    }
}

// A function to handle Updating the mouse pos.
function updateMousePos(evt) {
    let pos = getMousePos(evt);
    queueInput(-1, [Math.round(pos.x), 576 - Math.round(pos.y)]);
}


// A function to handle getting mouse pos.
function getMousePos(evt) {
    let x = Math.min(1024, Math.max(0, (evt.clientX - rect.left)));
    let y = Math.min(576, Math.max(0, (evt.clientY - rect.top)));
    return {
        x: x,
        y: y
    };
}


// Push a input message into the queue.
function queueInput(key, state) {
    if (keys.includes(key)){
        let message = {
            t: 'i',
            k: key,
            s: state
        };
        socket.send(JSON.stringify(message));
    }
}


// A helper function to validate email addresses.
function validateEmail(email) {
    let pattern = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
    return pattern.test(email);
}


// The function which handles 'login' button clicks.
function loginHandler() {
    let message = {
        t: 'login',
        username: document.getElementById('usernameField').value,
        password: document.getElementById('passwordField').value
    };
    socket.send(JSON.stringify(message));
    document.getElementById('usernameField').value = '';
    document.getElementById('passwordField').value = '';
}

// The function which handles 'login cancle' button clicks.
function cancleHandler() {
    document.getElementById('usernameField').value = '';
    document.getElementById('passwordField').value = '';
}

// The function which handles 'forgot my password' button clicks.
function forgotMyPwdHanlder() {
    let username = document.getElementById('usernameField').value;
    if (username.length > 0) {
        let message = {
            t: 'forgot',
            username: username
        };
        socket.send(JSON.stringify(message));
        document.getElementById('usernameField').value = '';
        alert('Request sent.');
    } else {
        alert('Please enter username.');
    }

}

// The function which handles 'Create new account' button clicks.
function newAccHandler() {
    document.getElementById('div_login').style.visibility = 'hidden';
    document.getElementById('div_new_acc').style.visibility = 'visible';
}

// The function which handles 'cancle-creating new account' button clicks.
function newCancleHandler() {
    document.getElementById('new_email').value = '';
    document.getElementById('new_username').value = '';
    document.getElementById('new_password').value = '';
    document.getElementById('new_passwordConf').value = '';
    document.getElementById('div_login').style.visibility = 'visible';
    document.getElementById('div_new_acc').style.visibility = 'hidden';
}

// The function which handles 'submit new account' button clicks.
function newAcceptHandler() {
    let password = document.getElementById('new_password').value;
    let passwordConf = document.getElementById('new_passwordConf').value;
    let email = document.getElementById('new_email').value;
    let username = document.getElementById('new_username').value;
    if (password === '' || username === '' || email === '') {
        alert("Please fill in all fields.");
    } else if (password != passwordConf) {
        document.getElementById('new_password').value = '';
        document.getElementById('new_passwordConf').value = '';
        alert("Passwords do not match.");
    } else if (!validateEmail(email)) {
        alert("Email invalid.");
    } else {
        let message = {
            t: 'newAcc',
            username: username,
            password: password,
            email: email
        };
        socket.send(JSON.stringify(message));
        document.getElementById('new_password').value = '';
        document.getElementById('new_passwordConf').value = '';
        document.getElementById('new_email').value = '';
        document.getElementById('new_username').value = '';
        document.getElementById('div_login').style.visibility = 'visible';
        document.getElementById('div_new_acc').style.visibility = 'hidden';
    }
}
