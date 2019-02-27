import * as Assets from './Assets.js';

const ctx = document.getElementById('gameCanvas').getContext('2d');
const socket = io();
Assets.load_from_file('/client/Assets.json');

socket.on('draw', function(data) {
    // draw(dx, dy, sx, sy, frame)
    console.log(data);
    if (Assets.all_Sprite_Loaded()) {
        ctx.clearRect(0, 0, 1024, 576);
        for (var i = 0; i < data.length; i++) {
            let sprite = Assets.get_Sprite(data[i].n);
            sprite.draw(data[i].x, data[i].y, data[i].f);
        }
    }
})

document.onkeydown = function(event){
        if(event.keyCode === 87)
            socket.emit('in',{k:'w',s:true});
        else if(event.keyCode === 65)
            socket.emit('in',{k:'a',s:true});
        else if(event.keyCode === 83)
            socket.emit('in',{k:'s',s:true});
        else if(event.keyCode === 68)
            socket.emit('in',{k:'d',s:true});
    }

document.onkeyup = function(event){
        if(event.keyCode === 87)
            socket.emit('in',{k:'w',s:false});
        else if(event.keyCode === 65)
            socket.emit('in',{k:'a',s:false});
        else if(event.keyCode === 83)
            socket.emit('in',{k:'s',s:false});
        else if(event.keyCode === 68) 
            socket.emit('in',{k:'d',s:false});
}