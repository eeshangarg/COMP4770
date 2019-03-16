import {spriteLoaded} from './Assets.js';
let ctx = document.getElementById('gameCanvas').getContext('2d');

// The object class to handle sprites, which area a extension of images.
class Sprite {

    // Create a spirte based of Assets.json.
    constructor(spriteName, imgSrc, frameCount) {
        var self = this;
        this.sprite = spriteName;
        this.image = new Image();
        this.image.onload = function() {
            self.width = this.width / frameCount;
            self.height = this.height;
            self.halfWidth = self.width/2;
            self.halfHeight = self.height/2;
            spriteLoaded();
            console.log(spriteName + ' Loaded');
        }
        this.image.src = imgSrc;
    }

    // Draw a image at a frame.
    draw(dx, dy, frame) {
        ctx.drawImage(
            this.image,
            this.width * frame,
            0,
            this.width,
            this.height,
            dx+this.halfWidth,
            dy-this.halfHeight,
            this.width,
            this.height);
    }

}

export default Sprite;