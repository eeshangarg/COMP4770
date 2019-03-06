/* istanbul ignore file */

function fakeGameEngine(socket) {

    console.log("Game engine created -> ", socket.id);

    const {
        getAnimation,
        draw,
        update
    } = require('./../rendering/Animator.js');

    const emitFrame = require('./IOHandler.js').emitFrame;

    // TODO: Remove these Abitary functions to test IO
    // This following code block acts to simulate a game state. This is 
    // to be removed and replaced with game_state_init();

    let x = getAnimation("playerRunR");
    let y = getAnimation("playerIdelR");
    let z = getAnimation("cave-platform");
    let dx = 50;
    let dy = 50;

    let inputMap = {
        w: false,
        a: false,
        d: false,
        s: false
    };

    let running = true;

    socket.on('close', function close() {
        running = false;
    });

    let gameInterval = setInterval(function() {
        if (running) {
            for (let w = 0; w < 1038; w += 16) {
                for (let h = 502; h < 576; h += 16) {
                    draw(z, w, h);
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

                update(x);
                draw(x, dx, dy);
            } else {
                update(y);
                draw(y, dx, dy);
            }
            emitFrame(socket);

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
