// @flow
/* global module */

function queue_Animation(SpriteName: string, frame: number, dx: number, dy: number) {
    renderQueue.push({
        n: SpriteName,
        f: frame,
        x: dx,
        y: dy
    });
}


let renderQueue = [];
module.exports.queue_Animation = queue_Animation;

/* global require */
const {
    getAnimation,
    draw,
    update
} = require('./Animator.js');


// flowlint unclear-type:off 
/* istanbul ignore next */
function IO_init(server: Object) {
    // flowlint-next-line untyped-import:off
    let io = require('socket.io')(server, {});
    io.sockets.on('connection', function(socket: Object) {
        // TODO: Remove these Abitary functions to test IO
        let x = getAnimation("playerRunR");
        let y = getAnimation("playerIdelR");

        let dx = 50;
        let dy = 50;
        let w = false;
        let a = false;
        let d = false;
        let s = false;

        socket.on('in', function(data: Object) {

            if (data.k === 'w') {
                if (data.s) {
                    w = true;
                } else {
                    w = false;
                }
            } else if (data.k === 'a') {
                if (data.s) {
                    a = true;
                } else {
                    a = false;
                }
            } else if (data.k === 's') {
                if (data.s) {
                    s = true;
                } else {
                    s = false;
                }
            } else if (data.k === 'd') {
                if (data.s) {
                    d = true;
                } else {
                    d = false;
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
        }, 16.6666);

    });
}


/* istanbul ignore next */
function emitFrame(socket: Object) {
    socket.emit('draw', renderQueue);
    renderQueue = []
}
// flowlint unclear-type:error

module.exports.IO_init = IO_init;
module.exports.emitFrame = emitFrame;