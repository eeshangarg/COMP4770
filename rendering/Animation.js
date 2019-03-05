// @flow
/* global module */

class Animation {

    id: number;
    SpriteName: string;
    AnimationName: string;
    FrameCount: number;
    CurrentFrame: number;
    AnimationFrame: number;
    FrameRate: number;
    XSize: number;
    YSize: number;

    constructor(animationName: string, spriteName: string, ident: number, frameCount: number, fps: number, x: number, y: number) {
        this.id = ident;
        this.AnimationName = animationName;
        this.SpriteName = spriteName;
        this.FrameCount = frameCount - 1;
        this.CurrentFrame = 0;
        this.AnimationFrame = 0;
        this.FrameRate = 60 / fps;
        this.XSize = x;
        this.YSize = y;
    }
}

module.exports = Animation;