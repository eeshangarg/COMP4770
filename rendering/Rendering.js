// @flow
/* global module */
/* global require */
// flowlint untyped-import:off
// flowlint unclear-type:off

const Animation = require('./Animation.js');
const fs = require("fs");
const path = require("path");

// The map which holds all the Animations loaded in from the config. 
const animationMap = new Map();
const tagToAnimationNames = new Map();
const idMap =  [];

/* istanbul ignore next */
function loadAnimations(fileName: string) {
    tagToAnimationNames.set("dec", []);
    tagToAnimationNames.set("effect", []);
    tagToAnimationNames.set("player", []);
    tagToAnimationNames.set("npc", []);
    tagToAnimationNames.set("item", []);
    tagToAnimationNames.set("tile", []);
    tagToAnimationNames.set("background", []);
    tagToAnimationNames.set("misc", []);

    fs.readFile(path.resolve(fileName), function(error: Object, file: Object) {
        // Read in the Animations file as a JSON.
        let content = JSON.parse(file);
        let j = 0;

        for (let i = 0; i < content.length; i++) {
            if (content[i].type === "static"){
                setAnimation(content[i].AnimationName,
                             content[i].SpriteName,
                             content[i].SpriteName,
                             j, j, content[i].frameCount,
                             content[i].fps, content[i].x,
                             content[i].y);
                idMap.push({name: content[i].SpriteName, id: j});
                j += 1;
            }
            else {
                setAnimation(content[i].AnimationName,
                             content[i].SpriteNameL,
                             content[i].SpriteNameR,
                             j, j+1, content[i].frameCount,
                             content[i].fps, content[i].x,
                             content[i].y);
                idMap.push({name: content[i].SpriteNameR, id: j});
                idMap.push({name: content[i].SpriteNameL, id: j+1});
                j += 2;
            }

            if (content[i].tag === "npc" || content[i].tag === "player") {
                if (!content[i].AnimationName.endsWith('Idle')) {
                    continue;
                }
            }

            // $FlowFixMe
            tagToAnimationNames.get(content[i].tag).push(content[i].AnimationName);
        }
    });
}


function getAnimation(AnimationName: string): Animation {
    let x = animationMap.get(AnimationName);
    /* istanbul ignore next */
    if (typeof x !== 'undefined') {
        let copy = new Animation(x.name, x.spriteR, x.spriteL,
                                 x.rid, x.lid, x.frameCount + 1,
                                 60 / x.fps, x.width, x.height);
        return copy;
    } else {
        /* istanbul ignore next */
        let copy = new Animation('error', 'error', 'error', 0, 0, 1, 1, 1, 1);
        /* istanbul ignore next */
        return copy;
    }
}

/* istanbul ignore next */
function getAnimationIDMap(): Object {
    return idMap;
}

function setAnimation(AnimationName: string,
                      spriteNameR: string,
                      spriteNameL: string,
                      rid: number, lid: number,
                      frameCount: number, fps: number,
                      x: number, y: number) {
    const anim = new Animation(AnimationName, spriteNameR,
                               spriteNameL, rid, lid,
                               frameCount, fps, x, y);
    animationMap.set(AnimationName, anim);
}

/* istanbul ignore next */
function getAnimationsByTag(tag: string): ?Array<string> {
    if (tagToAnimationNames.get(tag) === undefined) {
        return [];
    }
    return tagToAnimationNames.get(tag);
}

module.exports = {
    'setAnimation': setAnimation,
    'getAnimation': getAnimation,
    'loadAnimations': loadAnimations,
    'getAnimationIDMap': getAnimationIDMap,
    'getAnimationsByTag': getAnimationsByTag
}
