/* istanbul ignore file */


// The map which connected sockets tied to a ID.
let socketMap = new Map();
let spLevels = [];


// Requires
const fs = require("fs");
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
    let level1 = fs.readFileSync(__dirname + "/../../config/levels/level_1.json");
    spLevels.push(JSON.parse(level1));
    let level2 = fs.readFileSync(__dirname + "/../../config/levels/level_2.json");
    spLevels.push(JSON.parse(level2));
    let level3 = fs.readFileSync(__dirname + "/../../config/levels/level_3.json");
    spLevels.push(JSON.parse(level3));
    let level4 = fs.readFileSync(__dirname + "/../../config/levels/level_4.json");
    spLevels.push(JSON.parse(level4));
    let level5 = fs.readFileSync(__dirname + "/../../config/levels/level_5.json");
    spLevels.push(JSON.parse(level5));

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
    let query = {
        username: data.username
    };
    let newvalues = {
        $set: {
            password: hash
        }
    };

    let email = null;

    db.collection('accounts').findOne(query, function(err, result) {
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

        transporter.sendMail(mailOptions, function(error, info) {
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
            IOHandler(ws, db);
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
    db.collection('accounts').findOne({
        username: data.username
    }, function(err, result) {
        if (err) throw err;
        if (result == null) {
            db.collection('accounts').insertOne(user, function(err, result) {
                if (err) throw err;
                db.createCollection(data.username + 'Progress', function(err, result) {
                    if (err) throw err;
                    let blankProgress = {
                        levelCompleted: 0,
                        coins: 0
                    };
                    db.collection(data.username + 'Progress').insertOne(blankProgress, function(err, result) {
                        if (err) throw err;
                    });
                });



                db.createCollection(data.username + 'Levels', function(err, result) {
                    if (err) throw err;
                    // Create a blank level array and assign it to the player Account.
                    levels = []
                    let levelBlank = JSON.parse(fs.readFileSync(__dirname + "/../../config/levels/level_blank.json"));
                    for (let i = 1; i <= 5; i++) {
                        levelBlank.name = "My level " + i;
                        levelBlank.username = data.username;
                        levels.push(Object.assign({}, levelBlank));
                    }

                    db.collection(data.username + 'Levels').insertMany(levels, function(err, result) {
                        if (err) throw err;
                    });
                });


                let message = {
                    t: 'login',
                    valid: 1
                };

                let flatJson = flatstr(JSON.stringify(message));
                ws.send(flatJson);
                ws.userName = data.username;
                IOHandler(ws, db);
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
function IOHandler(ws, db) {
    // Clear the file loading listener.
    ws.removeAllListeners('message');
    // Create a instance of a fakeGameEngine passed the socket.

    let game = new GameEngine(ws, db, spLevels);
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
    for (let i = 0; i < data.length; i++) {
        let key = data[i].k;
        switch (key) {
            case -2: // -1 -> click
                map.click = data[i].s;
                break;
            case -1: // 0 -> MousePos
                map.mousePos = data[i].s;
                break;
            case 87: // 87 -> "W"
                map.w = data[i].s;
                break;
            case 65: // 65 -> "A"
                map.a = data[i].s;
                break;
            case 83: // 83 -> "S"
                map.s = data[i].s;
                break;
            case 68: // 68 -> "D"
                map.d = data[i].s;
                break;
            case 71: // 71 -> "G"
                map.g = data[i].s;
                break;
            case 84: // 84 -> "T"
                map.t = data[i].s;
                break;
            case 81: // 81 -> "Q"
                map.q = data[i].s;
                break;
            case 69: // 69 -> "E"
                map.e = data[i].s;
                break;
            case 89: // 89 -> "Y"
                map.y = data[i].s;
                break;
            case 85: // 85 -> "U"
                map.u = data[i].s;
            case 13: // 13 -> "Enter"
                map.enter = data[i].s;
                break;
            case 32: // 32 -> "Space"
                map.space = data[i].s;
                break;
            case 27: // 27 -> "Escape"
                map.escape = data[i].s;
                break;
            case 37: // 37 -> ArrowKeyLeft
                map.arrowLeft = data[i].s;
                break;
            case 38: // 38 -> ArrowKeyUp
                map.arrowUp = data[i].s;
                break;
            case 39: // 39 -> ArrowKeyRight
                map.arrowRight = data[i].s;
                break;
            case 40: // 39 -> ArrowKeyRight
                map.arrowDown = data[i].s;
                break;
            case 46: // 46 -> ArrowKeyRight
                map.del = data[i].s;
                break;
            case 49: // 49 -> 1
                map.one = data[i].s;
                break;
            case 50: // 50 -> 2
                map.two = data[i].s;
                break;
            case 51: // 51 -> 3
                map.three = data[i].s;
                break;
            case 52: // 52 -> 4
                map.four = data[i].s;
                break;
            case 53: // 53 -> 5
                map.five = data[i].s;
                break;
            case 16: // 16 -> shift
                map.shift = data[i].s;
                break;
            case 17: // 17 -> control
                map.ctrl = data[i].s;
                break;
            case 187: // 187 -> +
                map.plus = data[i].s;
                break;
            case 189: // 189 -> -
                map.minus = data[i].s;
                break;
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