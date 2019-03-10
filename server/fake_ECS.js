/* istanbul ignore file */

function fakeGameEngine(socket) {

    console.log("Game engine created -> ", socket.id);

    const {
        getAnimation,
        draw,
        update
    } = require('./../rendering/Rendering.js');

    const {
        emitFrame, 
        setBackground,
        drawText,
        clearText
    } = require('./IOHandler.js');

    // TODO: Remove these Abitary functions to test IO
    // This following code block acts to simulate a game state. This is 
    // to be removed and replaced with game_state_init();

    let red = "#ff0000";
    let black = "#000000"
    let blue ="#000099";
    let green = "#00ff00";

    let x = getAnimation("playerRun");
    let y = getAnimation("playerIdel");
    let z = getAnimation("cave-platform");
    let dx = 50;
    let dy = 50;

    let inputMap = {
        w: false,
        a: false,
        d: false,
        s: false,
        space: false
    };

    let running = true;
    let dir = 1;

    socket.on('close', function close() {
        running = false;
    });

    setBackground(socket, "white", "cyan");
    

    let gameInterval = setInterval(function() {
        if (running) {
            for (let w = 0; w < 1038; w += 16) {
                for (let h = 300; h <= 332; h += 16) {
                    draw(z, 1, w, h);
                }
            }
            if (inputMap.space) {
                clearText(socket, "pp");
                setBackground(socket, "gray", "pink");
            }
            // Draw the Abitary animations to test.
            if (inputMap.w || inputMap.a || inputMap.s || inputMap.d) {

                if (inputMap.w) {
                    dy -= 5;
                }
                if (inputMap.a) {
                    dx -= 5;
                }
                if (inputMap.d) {
                    dx += 5;
                }
                if (inputMap.s) {
                    dy += 5;
                }

                if (inputMap.d && !inputMap.a){
                    dir = 1;
                }

                else if (!inputMap.d && inputMap.a){
                    dir = -1;
                }

                update(x);
                drawText(socket, "Running", "status", "20px pixeled", green, 875, 35);
                draw(x, dir, dx, dy);
            } else {
                update(y);
                drawText(socket, "Idel", "status", "20px pixeled", blue, 875, 35);
                draw(y, dir, dx, dy);
            }
            let string = "Pos :" + dx + "," + dy;
            drawText(socket, string, "pos", "15px PS2P",  red, 20, 20);
            emitFrame(socket, dx, dy);

        } else {
            
            clearInterval(gameInterval);
        }
    }, 16.666);

    function setInputMap(map) {
        inputMap = map;
    }

    function getInputMap() {
        return inputMap;
    }

    module.exports.getInputMap = getInputMap;
    module.exports.setInputMap = setInputMap;
}


module.exports.fakeGameEngine = fakeGameEngine;
