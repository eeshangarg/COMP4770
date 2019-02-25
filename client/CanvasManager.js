import * as Assets from './Assets.js';

const ctx = document.getElementById('gameCanvas').getContext('2d');
const socket = io();  
Assets.load_from_file('/client/Assets.json');

socket.on('draw', function(data){
    if (Assets.all_Sprite_Loaded()){
        ctx.clearRect(0,0,1280,720);
        for (var i = 0; i < data.length; i++) {
            let sprite = Assets.get_Sprite(data[i].n);
            sprite.draw(data[i].x, data[i].y, data[i].f);
        }
    }
})
