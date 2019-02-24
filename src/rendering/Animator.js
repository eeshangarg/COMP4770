// @flow
/* global module */
/* global require */
const Animation = require('./Animation.js');
const queue_Animation = require('./IO_Handler.js').queue_Animation;
const fs = require("fs");

const AnimationMap = new Map();

function loadAnimations(fileName: string) {
    // flowlint-next-line unclear-type:off
    fs.readFile(fileName, 'utf8', function (err: Object, file: Object) {
        if (err) throw err;
        let content = JSON.parse(file);
        for (let i = 0; i < content.length; i++) {
            setAnimation(content[i].AnimationName, content[i].SpriteName, content[i].frameCount, content[i].fps, content[i].x, content[i].y);
        }
    });
}


function update(anim: Animation) {
    if (anim.FrameCount > 0) {
        anim.CurrentFrame++;
        if(anim.CurrentFrame >= anim.FrameRate) {
            anim.CurrentFrame = 0;
            anim.AnimationFrame++;
            if (anim.AnimationFrame > anim.FrameCount){
            anim.AnimationFrame = 0;
            }
        }
    }
}

function draw(anim: Animation, dx: number, dy: number) {
    queue_Animation(anim.SpriteName, anim.AnimationFrame, dx, dy);
}


function getAnimation(AnimationName: string): Animation {
    const x = AnimationMap.get(AnimationName);
    if (typeof x !== 'undefined')
    {
        let y = new Animation(x.AnimationName, x.SpriteName, x.FrameCount+1, 30/x.FrameRate,x.XSize,x.YSize);
        return y;
    }
    else
    {
        let y = new Animation("null", "null", 30, 30, 1, 1);
        return y;
    }
}





function setAnimation(AnimationName: string, spriteName: string, frameCount: number, fps: number, x: number, y: number) {
    const anim = new Animation(AnimationName, spriteName, frameCount, fps, x, y);
    AnimationMap.set(AnimationName, anim);
}

module.exports = {
    'setAnimation' : setAnimation,
    'getAnimation' : getAnimation,
    'draw' : draw, 
    'update' : update,
    'loadAnimations' : loadAnimations
}