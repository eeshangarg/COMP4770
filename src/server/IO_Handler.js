/* istanbul ignore file */
let renderQueue = [];

function queueAnimation(SpriteName, frame, dx, dy) {
    renderQueue.push({
        n: SpriteName,
        f: frame,
        x: dx,
        y: dy
    });
}

module.exports.queueAnimation = queueAnimation;

function IO_init(scServer) {

    const {
        getAnimation,
        draw,
        update
    } = require('./../rendering/Animator.js');

    scServer.on('connection', function(socket) {

        // TODO: Remove these Abitary functions to test IO
        // This following code block acts to simulate a game state. This is 
        // to be removed and replaced with game_state_init();

        let x = getAnimation("playerRunR");
        let y = getAnimation("playerIdelR");

        let dx = 50;
        let dy = 50;
        let w = false;
        let a = false;
        let d = false;
        let s = false;

        // 'i' -> Input. 
        socket.on('i', function(inputData) {

            let data = JSON.parse(inputData);

            for (var i = 0; i < data.length; i++) {
                if (data[i].k === 'w') {
                    if (data[i].s) {
                        w = true;
                    } else {
                        w = false;
                    }
                } else if (data[i].k === 'a') {
                    if (data[i].s) {
                        a = true;
                    } else {
                        a = false;
                    }
                } else if (data[i].k === 's') {
                    if (data[i].s) {
                        s = true;
                    } else {
                        s = false;
                    }
                } else if (data[i].k === 'd') {
                    if (data[i].s) {
                        d = true;
                    } else {
                        d = false;
                    }
                }
            }

        });

        // Main 30 FPS rendering calls. 
        setInterval(function() {
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
        }, 16.666);
    });
}

function emitFrame(socket) {
    // send draw call 'd' -> Draw. 
    socket.emit('d', JSON.stringify(renderQueue));
    renderQueue = []
}

module.exports.IO_init = IO_init;
module.exports.emitFrame = emitFrame;