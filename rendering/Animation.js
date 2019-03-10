// @flow
/* global module */

class Animation {

    name: string;
    rid: number;
    lid: number;
    spriteR: string;
    spriteL: string;
    frameCount: number;
    currentFrame: number;
    animationFrame: number;
    fps: number;
    width: number;
    height: number;

    constructor(name: string, spriteR: string, spriteL: string,
                rid: number, lid: number, frameCount: number,
                fps: number, width: number, height: number) {

        this.rid = rid;
        this.lid = lid;
        this.name = name;
        this.spriteR = spriteR;
        this.spriteL = spriteL;
        this.frameCount = frameCount - 1;
        this.currentFrame = 0;
        this.animationFrame = 0;
        this.fps = 60 / fps;
        this.width = width;
        this.height = height;
    }
}

module.exports = Animation;
