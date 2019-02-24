import * as Assets from './Assets.js';
const ctx = document.getElementById('gameCanvas').getContext('2d');
class Sprite {

    constructor(spriteName, imgSrc, frameCount) {
        var self = this;
        this.m_Name = spriteName;
        this.m_Image = new Image();
        this.m_Image.onload = function() {
            self.m_XSize = this.width / frameCount;
            self.m_YSize = this.height;
            Assets.sprite_Loaded();
            console.log(spriteName + ' Loaded');
        }
        this.m_Image.src = imgSrc;

    }

    draw(dx, dy, frame){
        ctx.drawImage(
            this.m_Image, 
            this.m_XSize*frame,
            0,
            this.m_XSize,
            this.m_YSize,
            dx,
            dy,
            this.m_XSize,
            this.m_YSize);
    }

}

export default Sprite;