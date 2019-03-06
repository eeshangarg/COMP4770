// @flow
/* global module */
/* global require */
// flowlint untyped-import:off
// flowlint unclear-type:off
const Animation = require('./Animation.js');
const queueAnimation = require('./../server/IOHandler.js').queueAnimation;
const fs = require("fs");
const path = require("path");

// The map which holds all the Animations loaded in from the config. 
const animationMap = new Map();
const idMap =  [];



/* istanbul ignore next */
function loadAnimations(fileName: string) {
    fs.readFile(path.resolve(fileName), function(error: Object, file: Object) {
        // Read in the Animations file as a JSON.
        let content = JSON.parse(file);
        for (let i = 0; i < content.length; i++) {
            setAnimation(content[i].AnimationName, content[i].SpriteName, i, content[i].frameCount, content[i].fps, content[i].x, content[i].y);
            idMap.push({name: content[i].AnimationName, id: i});
        }
    });

}


function update(anim: Animation) {
    // If the Animation is more then 1 frame long.
    if (anim.frameCount > 0) {
        // Update the current frame.
        anim.currentFrame++;
        // If FPS dictates, Queue up the next frame.
        if (anim.currentFrame >= anim.fps) {
            anim.currentFrame = 0;
            anim.animationFrame++;
            // Reset animation if over.
            if (anim.animationFrame > anim.frameCount) {
                anim.animationFrame = 0;
            }
        }
    }
}


function draw(anim: Animation, dx: number, dy: number) {
    /* istanbul ignore next */
    if (anim.frameCount == 0) {
        queueAnimation(anim.id, -1, dx, dy);
    }
    else {
        queueAnimation(anim.id, anim.animationFrame, dx, dy);
    }
    
}


function getAnimation(AnimationName: string): Animation {
    let x = animationMap.get(AnimationName);
    if (typeof x !== 'undefined') {
        let copy = new Animation(x.name, x.sprite, x.id, x.frameCount + 1, 60 / x.fps, x.width, x.height);
        return copy;
    } else {
        let copy = new Animation('error', 'error', 0, 1, 1, 1, 1);
        return copy;
    }
}

/* istanbul ignore next */
function getAnimationIDMap(): Object {
    /* istanbul ignore next */
    return idMap;
}

function setAnimation(AnimationName: string, spriteName: string, id: number, frameCount: number, fps: number, x: number, y: number) {
    const anim = new Animation(AnimationName, spriteName, id, frameCount, fps, x, y);
    animationMap.set(AnimationName, anim);
}


module.exports = {
    'setAnimation': setAnimation,
    'getAnimation': getAnimation,
    'draw': draw,
    'update': update,
    'loadAnimations': loadAnimations,
    'getAnimationIDMap': getAnimationIDMap
}
