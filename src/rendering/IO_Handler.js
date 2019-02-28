// @flow
/* global module */

let renderQueue = [];

function queue_Animation(SpriteName: string, frame: number, dx: number, dy: number) {
    renderQueue.push({
        n: SpriteName,
        f: frame,
        x: dx,
        y: dy
    });
}

module.exports.queue_Animation = queue_Animation;



// flowlint unclear-type:off
/* istanbul ignore next */
function IO_init(scServer: Object) {

    /* global require */
    const {
            getAnimation,
            draw,
            update
    } = require('./Animator.js');

    scServer.on('connection', function(socket: Object) {
        // TODO: Remove these Abitary functions to test IO
        let x = getAnimation("playerRunR");
        let y = getAnimation("playerIdelR");

        let dx = 50;
        let dy = 50;
        let w = false;
        let a = false;
        let d = false;
        let s = false;

        socket.on('i', function(data: Object) {
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
        }, 16.666 );
    });
}


/* istanbul ignore next */
function emitFrame(socket: Object) {
    socket.emit('d', renderQueue);
    renderQueue = []
}
// flowlint unclear-type:error

module.exports.IO_init = IO_init;
module.exports.emitFrame = emitFrame;