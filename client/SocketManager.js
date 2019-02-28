import * as Assets from './Assets.js';

const ctx = document.getElementById('gameCanvas').getContext('2d');
const socket = socketCluster.create('2000');
let input_Queue = [];

Assets.load_from_file('/client/Assets.json');

socket.on('d', function(data) {
    // draw(dx, dy, sx, sy, frame)
    if (Assets.all_Sprite_Loaded()) {
        ctx.clearRect(0, 0, 1024, 576);
        for (var i = 0; i < data.length; i++) {
            let sprite = Assets.get_Sprite(data[i].n);
            sprite.draw(data[i].x, data[i].y, data[i].f);
        }
    }
})

setInterval(function() { emit_Input() }, 16.666);

function queue_Input(key, state){
    input_Queue.push({k:key,s:state});
}

function emit_Input(){
    if (input_Queue.length != 0)
    {
        socket.emit('i', input_Queue);
        input_Queue = [];
    }
}


document.onkeydown = function(event){
        // TO DO add all keys to even types.
        if(event.keyCode === 87)
            queue_Input('w', true);
        else if(event.keyCode === 65)
            queue_Input('a', true);
        else if(event.keyCode === 83)
            queue_Input('s', true);
        else if(event.keyCode === 68)
            queue_Input('d', true);
    }

document.onkeyup = function(event){
        // TO DO add all keys to even types.
        if(event.keyCode === 87)
            queue_Input('w', false);
        else if(event.keyCode === 65)
            queue_Input('a', false);
        else if(event.keyCode === 83)
            queue_Input('s', false);
        else if(event.keyCode === 68) 
            queue_Input('d', false);
}