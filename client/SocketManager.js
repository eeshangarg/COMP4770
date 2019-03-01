import * as Assets from './Assets.js';

const ctx = document.getElementById('gameCanvas').getContext('2d');
const socket = socketCluster.create('2000');
let input_Queue = [];

Assets.load_from_file('/client/Assets.json');

// 'd' -> Draw. parse the data and render the frame.
socket.on('d', function(data) {
    let renderFrame = JSON.parse(data);
    if (Assets.all_Sprite_Loaded()) {
        ctx.clearRect(0, 0, 1024, 576);
        for (var i = 0; i < renderFrame.length; i++) {
            let sprite = Assets.get_Sprite(renderFrame[i].n);
            sprite.draw(renderFrame[i].x, renderFrame[i].y, renderFrame[i].f);
        }
    }
})


// 's' -> Sound.
socket.on('s', function(data) {
    // TODO
});


// Set the from emit 
setInterval(function() {
    emit_Input()
}, 16.666);


function emit_Input() {
    if (input_Queue.length != 0) {
        socket.emit('i', JSON.stringify(input_Queue));
        input_Queue = [];
    }
}


function queue_Input(key, state) {
    input_Queue.push({
        k: key,
        s: state
    });
}

// key up event.
document.onkeydown = function(event) {
    if (event.keyCode === 87)
        queue_Input('w', true);
    else if (event.keyCode === 65)
        queue_Input('a', true);
    else if (event.keyCode === 83)
        queue_Input('s', true);
    else if (event.keyCode === 68)
        queue_Input('d', true);
}

// Key Down events. 
document.onkeyup = function(event) {
    if (event.keyCode === 87)
        queue_Input('w', false);
    else if (event.keyCode === 65)
        queue_Input('a', false);
    else if (event.keyCode === 83)
        queue_Input('s', false);
    else if (event.keyCode === 68)
        queue_Input('d', false);
}