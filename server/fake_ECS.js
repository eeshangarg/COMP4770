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

    



    let inputMap = {
        w: false,
        a: false,
        d: false,
        s: false,
        space: false,
        enter:false
    };

    let running = true;
    let dir = 1;

    socket.on('close', function close() {
        running = false;
    });

    setBackground(socket, "white", "cyan");
    drawText(socket, "Hit enter for random BG colors!", "enterText", "15px PS2P", black, 300, 150);

    let gameInterval = setInterval(function() {
        if (running) {

            count += 1;

            for (let w = 0; w < 1038; w += 16) {
                for (let h = 300; h <= 332; h += 16) {
                    draw(z, 1, w, h);
                }
            }
            if (inputMap.enter && (count > 10)) {
                count = 0;
                clearText(socket, "enterText");
                let color1 = colors[Math.floor(Math.random()*colors.length)];
                let color2 = colors[Math.floor(Math.random()*colors.length)];
                setBackground(socket, color1, color2);
            }

            if (inputMap.space && primed) {
                primed = false;
                draw(atk, dir, dx, dy);
            }
            else if (!primed) {
                update(atk);
                draw(atk, dir, dx, dy);
                if (atk.animationFrame == 12) { 
                    atk.animationFrame = 0; 
                    primed = true;
                }
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

                if(primed) {
                    update(x);
                    draw(x, dir, dx, dy);
                }
                
                drawText(socket, "Running", "status", "20px pixeled", green, 875, 35);

            } else {

                if(primed) {
                    update(y);
                    draw(y, dir, dx, dy);
                }
                drawText(socket, "Idel", "status", "20px pixeled", blue, 875, 35);
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
