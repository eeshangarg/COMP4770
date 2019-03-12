// @flow
/* istanbul ignore file */
/* global module */
/* global require */
const GameEngine = require('./GameEngine.js');
const GameState = require('./GameState.js');

// flowlint untyped-import:off

class GameState_test extends GameState {

    update: void => void;
    init: void => void;

    constructor(game: GameEngine) {

        super();

        /* #############TO BE REMOVED################ */

        const {
            getAnimation,
            draw,
            update
        } = require('./../rendering/Rendering.js');

        const {
            emitFrame,
            setBackground,
            drawText,
            clearText
        } = require('./../server/IOHandler.js');

        let x = getAnimation("playerRun");
        let y = getAnimation("playerIdel");
        let atk = getAnimation("playerAtk");
        let z = getAnimation("cave-platform");
        let dx = 50;
        let dy = 50;
        let colors = ['red', 'blue', 'green', 'pink', 'purple', 'gray', 'cyan', 'lime', 'yellow'];
        let dir = 1;
        let primed = true;
        let count = 0;


        /* #############TO BE REMOVED################ */


        this.GameEngine = game;

        let inputMap = this.GameEngine.getInputMap();

        this.paused = false;

        this.init = function() {
            // Do Some stuff here.
            setBackground(this.GameEngine.socket, "white", "cyan");
            drawText(this.GameEngine.socket, "Hit enter for random BG colors!", "enterText", "15px PS2P", "#000000", 300, 150);
        };


        this.update = function() {

            count += 1;

            for (let w = 0; w < 1038; w += 16) {
                for (let h = 300; h <= 332; h += 16) {
                    draw(z, 1, w, h);
                }
            }
            if (inputMap.enter && (count > 10)) {
                count = 0;
                clearText(this.GameEngine.socket, "enterText");
                let color1 = colors[Math.floor(Math.random() * colors.length)];
                let color2 = colors[Math.floor(Math.random() * colors.length)];
                setBackground(this.GameEngine.socket, color1, color2);
            }

            if (inputMap.space && primed) {
                primed = false;
                draw(atk, dir, dx, dy);
            } else if (!primed) {
                update(atk);
                draw(atk, dir, dx, dy);
                if (atk.animationFrame == 12) {
                    atk.animationFrame = 0;
                    primed = true;
                }
            }

            // Draw the Abitary animations to test.
            if (inputMap.w || inputMap.a || inputMap.s || inputMap.d) {

                if (inputMap.w) {
                    dy -= 5;
                }
                if (inputMap.a) {
                    dx -= 5;
                }
                if (inputMap.d) {
                    dx += 5;
                }
                if (inputMap.s) {
                    dy += 5;
                }

                if (inputMap.d && !inputMap.a) {
                    dir = 1;
                } else if (!inputMap.d && inputMap.a) {
                    dir = -1;
                }

                if (primed) {
                    update(x);
                    draw(x, dir, dx, dy);
                }

                drawText(this.GameEngine.socket, "Running", "status", "20px pixeled", "#00ff00", 875, 35);

            } else {

                if (primed) {
                    update(y);
                    draw(y, dir, dx, dy);
                }
                drawText(this.GameEngine.socket, "Idel", "status", "20px pixeled", "#000099", 875, 35);
            }
            let string = "Pos :" + dx + "," + dy;
            drawText(this.GameEngine.socket, string, "pos", "15px PS2P", "#ff0000", 20, 20);
            emitFrame(this.GameEngine.socket, dx, dy);
        }
    }
}


module.exports = GameState_test;