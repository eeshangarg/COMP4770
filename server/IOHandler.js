/* istanbul ignore file */


// The map which connected sockets tied to a ID.
let socketMap = new Map();

// Requires
const GameEngine = require('./../ecs/GameEngine.js');
const shortid = require('shortid');
const bcrypt = require('bcryptjs');
const flatstr = require('flatstr');
const {
    getAnimationIDMap,
    loadAnimations,
    getRenderQueue
} = require('./../rendering/Rendering.js');


const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'theknightbefore4770@gmail.com',
    pass: 'coat.area'
  }
});



// the function to intialize IO-helpers for websockets, should be passed the WebSocket-Server.
function initIO(wss, db) {

    // Load the Animation config file.
    loadAnimations(__dirname + "/../../config/Animation.json");

    console.log('IO Initialzied for WebSocket-Server.');

    // Create a blank serverList.
    wss.serverList = [];
    // On a client socketing in, create handle for client websocket "ws".
    wss.on('connection', (ws) => {

        // Generate a socket ID to refer to the current socket connection.
        ws.id = shortid.generate();

        // Push the given ID into the socket map.
        socketMap.set(ws.id, ws);

        console.log('socket $ connected, ID: ', ws.id, " Client Count: ", wss.clients.size);

        ws.on('message', (message) => {
            let data = JSON.parse(message);
            if (data.t === 'load') {
                let message = {
                    t: 'animMap',
                    d: getAnimationIDMap()
                };
                let flatJson = flatstr(JSON.stringify(message));
                ws.send(flatJson);
            } else if (data.t === 'login') {
                processLogin(ws, data, db);
            } else if (data.t === 'newAcc') {
                newAccHanlder(ws, data, db);
            } else if (data.t === 'forgot') {
                forgotPassword(ws, data, db);
            }
        });

        ws.on('close', function close() {
            console.log('socket closed, ID: ', ws.id, " Client Count: ", wss.clients.size);
            socketMap.delete(ws.id);
        });

    });

}

function forgotPassword(ws, data, db) {
    let newPass = shortid.generate();
    console.log('passrest', newPass);
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(newPass, salt);
    let query = {username: data.username};
    let newvalues = { $set: {password:hash } };
    let email = null;

    db.collection('accounts').findOne(query,  function(err, result) {
        if (result != null) {
            email = result.email;
        }
    });

    db.collection('accounts').updateOne(query, newvalues, function(err, res) {
        if (err) throw err;
        console.log(email);
        let mailOptions = {
            from: 'theknightbefore4770@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: newPass
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    });
}

// The function which handles processing login data.
function processLogin(ws, data, db) {

    db.collection('accounts').findOne({
        username: data.username
    }, function(err, result) {
        if (err) throw err;
        if (result != null && bcrypt.compareSync(data.password, result.password)) {
            let message = {
                t: 'login',
                valid: 1
            };
            let flatJson = flatstr(JSON.stringify(message));
            ws.send(flatJson);
            ws.userName = data.username;
            IOHandler(ws);
        } else {
            let message = {
                t: 'login',
                valid: 0
            };
            let flatJson = flatstr(JSON.stringify(message));
            ws.send(flatJson);
        }

    });
}


// The function to attempt to registar new accounts.
function newAccHanlder(ws, data, db) {

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(data.password, salt);
    let user = {
        username: data.username,
        password: hash,
        email: data.email
    };

    db.collection('accounts').findOne({username: data.username}, function(err, result) {
        if (err) throw err;
        if (result == null){
            db.collection('accounts').insertOne(user, function(err, result) {
                if (err) throw err;
                let message = {
                    t: 'login',
                    valid: 1
                };
                let flatJson = flatstr(JSON.stringify(message));
                ws.send(flatJson);
                ws.userName = data.username;
                IOHandler(ws);
            });
        } else {
            let message = {
                t: 'taken'
            };
            let flatJson = flatstr(JSON.stringify(message));
            ws.send(flatJson);
        }
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
        let flatJson = flatstr(JSON.stringify(message));
        let buf = new Buffer.from(flatJson, 'utf8');
        ws.send(buf);
    }
}


// The function which handles clearing text Strings.
function clearText(ws, key) {
    if (ws.readyState == 1) {
        let message = {
            t: 'c',
            k: key,
        };
        let flatJson = flatstr(JSON.stringify(message));
        let buf = new Buffer.from(flatJson, 'utf8');
        ws.send(buf);
    }

}

// The function which emits a frame through a Websocket.
function emitFrame(ws, renderQueue, px, py) {
    if (ws.readyState == 1) {
        //send draw call 'd' -> Draw.
        let message = {
            t: 'd',
            p: [px - 512, py - 288],
            d: renderQueue
        };
        let flatJson = flatstr(JSON.stringify(message));
        let buf = new Buffer.from(flatJson, 'utf8');
        ws.send(buf);
    }

}


// The function that handles background-image changing.
function setBackground(ws, bgName) {
    if (ws.readyState == 1) {
        let message = {
            t: 'b',
            i: bgName
        }
        let flatJson = flatstr(JSON.stringify(message));
        let buf = new Buffer.from(flatJson, 'utf8');
        ws.send(buf);
    }
}

// The function that handles background-Gradient changing.
function setBackgroundGradient(ws, c1, c2) {
    if (ws.readyState == 1) {
        let message = {
            t: 'g',
            c1: c1,
            c2: c2
        }

        let flatJson = flatstr(JSON.stringify(message));
        let buf = new Buffer.from(flatJson, 'utf8');
        ws.send(buf);
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
        if (data[i].k === 'mp') {
            map.mousePos = data[i].s;
        } else if (data[i].k === 'w') {
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
        } else if (data[i].k === 'esc') {
            map.escape = state;
        } else if (data[i].k === 't') {
            map.t = state;
        } else if (data[i].k === 'click') {
            map.click = state;
        } else if (data[i].k === 'arrowLeft') {
            map.arrowLeft = state;
        } else if (data[i].k === 'arrowRight') {
            map.arrowRight = state;
        } else if (data[i].k === 'g') {
            map.g = state;
        } else if (data[i].k === 'del') {
            map.del = state;
        }
    }
    return map;
}


// Declare Exports.
module.exports = {
    'initIO': initIO,
    'emitFrame': emitFrame,
    'setBackground': setBackground,
    'setBackgroundGradient': setBackgroundGradient,
    'drawText': drawText,
    'clearText': clearText
};
