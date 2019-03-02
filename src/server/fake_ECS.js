/* istanbul ignore file */

function fakeGameEngine(socket) {

    console.log("Game engine created -> ", socket.id);

    const {
        getAnimation,
        draw,
        update
    } = require('./../rendering/Animator.js');

    const emitFrame = require('./IO_Handler.js').emitFrame;

    // TODO: Remove these Abitary functions to test IO
    // This following code block acts to simulate a game state. This is 
    // to be removed and replaced with game_state_init();

    let x = getAnimation("playerRunR");
    let y = getAnimation("playerIdelR");
    let w = false;
    let a = false;
    let d = false;
    let s = false;
    let dx = 50;
    let dy = 50;
    running = true;

    socket.on('close', function close() {
        running = false;
    });

    let gameInterval = setInterval(function() {
        if (running) {
            // Draw the Abitary animations to test.
            if (w || a || s || d) {
                if (w) {
                    dy -= 5;
                }
                if (a) {
                    dx -= 5;
                }
                if (d) {
                    dx += 5;
                }
                if (s) {
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


    function updateInputData(data) {

        for (var i = 0; i < data.length; i++) {
            let state = true;
            if (data[i].s === '0') {
                state = false;
            }

            if (data[i].k === 'w') {
                if (state) {
                    w = true;
                } else {
                    w = false;
                }
            } else if (data[i].k === 'a') {
                if (state) {
                    a = true;
                } else {
                    a = false;
                }
            } else if (data[i].k === 's') {
                if (state) {
                    s = true;
                } else {
                    s = false;
                }
            } else if (data[i].k === 'd') {
                if (state) {
                    d = true;
                } else {
                    d = false;
                }
            }
        }
    }

    module.exports.updateInputData = updateInputData;
}


module.exports.fakeGameEngine = fakeGameEngine;