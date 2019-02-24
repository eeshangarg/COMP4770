// @flow
/* global module */

class Animation {

    SpriteName: string;
    AnimationName: string;
    FrameCount: number;
    CurrentFrame: number;
    AnimationFrame: number;
    FrameRate: number;
    XSize: number;
    YSize: number;


    constructor(animationName: string, spriteName: string, frameCount: number, fps: number, x: number, y: number) {
        this.AnimationName = animationName;
        this.SpriteName = spriteName;
        this.FrameCount = frameCount - 1 ;
        this.CurrentFrame = 0;
        this.AnimationFrame = 0;
        this.FrameRate = 30 / fps;
        this.XSize = x;
        this.YSize = y;

    }
}

module.exports  = Animation;

