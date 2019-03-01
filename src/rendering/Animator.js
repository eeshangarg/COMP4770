// @flow
/* global module */
/* global require */
const Animation = require('./Animation.js');
// flowlint-next-line untyped-import:off
const queueAnimation = require('./../server/IO_Handler.js').queueAnimation;
const fs = require("fs");
const path = require("path");

// The map which holds all the Animations loaded in from the config. 
const AnimationMap = new Map();


/* istanbul ignore next */
function loadAnimations(fileName: string) {
    // flowlint-next-line unclear-type:off
    fs.readFile(path.resolve(fileName), function(error: Object, file: Object) {
        // Read in the Animations file as a JSON.
        let content = JSON.parse(file);
        for (let i = 0; i < content.length; i++) {
            setAnimation(content[i].AnimationName, content[i].SpriteName, content[i].frameCount, content[i].fps, content[i].x, content[i].y);
        }
    });
}


function update(anim: Animation) {
    // If the Animation is more then 1 frame long.
    if (anim.FrameCount > 0) {
        // Update the current frame.
        anim.CurrentFrame++;
        // If FPS dictates, Queue up the next frame.
        if (anim.CurrentFrame >= anim.FrameRate) {
            anim.CurrentFrame = 0;
            anim.AnimationFrame++;
            // Reset animation if over.
            if (anim.AnimationFrame > anim.FrameCount) {
                anim.AnimationFrame = 0;
            }
        }
    }
}


function draw(anim: Animation, dx: number, dy: number) {
    queueAnimation(anim.SpriteName, anim.AnimationFrame, dx, dy);
}


function getAnimation(AnimationName: string): Animation {
    let x = AnimationMap.get(AnimationName);
    if (typeof x !== 'undefined') {
        let copy = new Animation(x.AnimationName, x.SpriteName, x.FrameCount + 1, 60 / x.FrameRate, x.XSize, x.YSize);
        return copy;
    } else {
        let copy = new Animation('error', 'error', 1, 1, 1, 1);
        return copy;
    }
}


function setAnimation(AnimationName: string, spriteName: string, frameCount: number, fps: number, x: number, y: number) {
    const anim = new Animation(AnimationName, spriteName, frameCount, fps, x, y);
    AnimationMap.set(AnimationName, anim);
}


module.exports = {
    'setAnimation': setAnimation,
    'getAnimation': getAnimation,
    'draw': draw,
    'update': update,
    'loadAnimations': loadAnimations
}