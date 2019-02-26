// @flow
/* global module */
/* global require */
const Animation = require('./Animation.js');
const queue_Animation = require('./IO_Handler.js').queue_Animation;
const fs = require("fs");
const AnimationMap = new Map();

/* istanbul ignore next */
function loadAnimations(fileName: string) {
    let content=JSON.parse(fs.readFileSync(fileName, "utf8"));
    for (let i = 0; i < content.length; i++) {
        setAnimation(content[i].AnimationName, content[i].SpriteName, content[i].frameCount, content[i].fps, content[i].x, content[i].y);
    }
}


function update(anim: Animation) {
    // If the Animation is more then 1 frame long.
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
    let x = AnimationMap.get(AnimationName);
    if (typeof x !== 'undefined') {
        let copy = new Animation(x.AnimationName, x.SpriteName, x.FrameCount+1, 30/x.FrameRate,x.XSize,x.YSize);
        return copy;
    }
    else {
        let copy = new Animation('null', 'null', 30, 30, 1, 1);
        return copy;
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