// @flow
/* global module */

function queue_Animation(SpriteName: string, frame: number, dx: number, dy: number){
    renderQueue.push({n:SpriteName,f:frame,x:dx,y:dy});
}


let renderQueue = [];

/* global require */
const {getAnimation, draw, update} = require('./Animator.js');

// flowlint-next-line unclear-type:off
function IO_init(server: Object){
    // flowlint-next-line untyped-import:off
    let io = require('socket.io')(server, {});
    // flowlint-next-line unclear-type:off
    io.sockets.on('connection', function(socket: Object) {
        let x = getAnimation("playerAtkL");
        let x2 = getAnimation("playerAtkL");
        let z = getAnimation("playerDeathL");
        setInterval(function(){
            draw(x,50,50);
            update(x);
            draw(x2, 250, 50);
            update(x2);
            update(x2);
            draw(z, 100, 100);
            update(z);
            emitFrame(socket);
        }, 33.333 );
    });
}

// flowlint-next-line unclear-type:off
function emitFrame(socket: Object){
    socket.emit('draw', renderQueue);
    renderQueue = []
}


module.exports = {
    'IO_init'  : IO_init,
    'emitFrame'  : emitFrame,
    'queue_Animation' : queue_Animation
}
