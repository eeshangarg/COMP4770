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
    XScale: number;
    YScale: number;

    constructor(animationName: string, spriteName: string, frameCount: number, fps: number, x: number, y: number) {
        this.AnimationName = animationName;
        this.SpriteName = spriteName;
        this.FrameCount = frameCount - 1 ;
        this.CurrentFrame = 0;
        this.AnimationFrame = 0;
        this.FrameRate = 60 / fps;
        this.XSize = x;
        this.YSize = y;
        this.XScale = 1;
        this.YScale = 1;
    }
}

module.exports  = Animation;

