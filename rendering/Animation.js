// @flow
/* global module */

class Animation {
    id: number;
    name: string;
    sprite: string;
    frameCount: number;
    currentFrame: number;
    animationFrame: number;
    fps: number;
    width: number;
    height: number;

    constructor(name: string, sprite: string,
                id: number, frameCount: number,
                fps: number, width: number, height: number) {
        this.id = id;
        this.name = name;
        this.sprite = sprite;
        this.frameCount = frameCount - 1;
        this.currentFrame = 0;
        this.animationFrame = 0;
        this.fps = 60 / fps;
        this.width = width;
        this.height = height;
    }
}

module.exports = Animation;
