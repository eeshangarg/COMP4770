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
    update: void => void;

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
        this.update = function() {
            // If the Animation is more then 1 frame long.
            if (this.frameCount > 0) {
                // Update the current frame.
                this.currentFrame++;
                // If FPS dictates, Queue up the next frame.
                if (this.currentFrame >= this.fps) {
                    this.currentFrame = 0;
                    this.animationFrame++;
                    // Reset animation if over.
                    if (this.animationFrame > this.frameCount) {
                        this.animationFrame = 0;
                    }
                }
            }
        }
    }
}

module.exports = Animation;