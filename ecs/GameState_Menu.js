// @flow
/* istanbul ignore file */
/* global module */
/* global require */

const GameState = require('./GameState.js');
const GameEngine = require('./GameEngine.js');
const Vec = require('./Vec.js');

class GameState_Menu extends GameState {
    game: GameEngine;
    title: string;
    selectedMenuIndex: number;
    menuItems: number;
    menuStrings: Array<string>;
    primed: boolean;
    countDown: number;

    constructor(game: GameEngine) {
        super();
        this.game = game;
        this.title = "The Knight Before";
        this.selectedMenuIndex = 0;
        this.menuStrings = [];
        this.primed = true;
        this.countDown = 0;
        this.init();
    }

    init() {
        this.menuStrings = [];
        this.menuStrings.push('Single Player');
        this.menuStrings.push('Level Editor');
        this.menuStrings.push('Items');
        this.menuStrings.push('Settings');
        this.game.setBackground('bg_menu');
        this.menuItems = this.menuStrings.length;
        this.game.drawText(this.title, 'title', '60px Seagram', '#F5F5F5', 305, 135);
        this.drawStrings();
    }

    update() {
        this.sUserInput();
        this.sRender();
    }


    drawStrings() {
            for (let i = 0; i < this.menuStrings.length; i++) {
                this.game.drawText(this.menuStrings[i], this.menuStrings[i], '20px PS2P', '#FDFEFE', 400, 235 + i*48);
            }
            let i = this.selectedMenuIndex;
            this.game.drawText(this.menuStrings[i], this.menuStrings[i], '20px PS2P', '#FFFF00', 400, 235 + i*48);
    }

    sUserInput() {
        if (this.primed == true){
            let inputMap = this.game.getInputMap();
            if (inputMap.s && !inputMap.w) {
                this.primed = false;
                this.selectedMenuIndex++;
                if (this.selectedMenuIndex >= this.menuItems){
                    this.selectedMenuIndex = 0;
                }
                this.drawStrings();
            }
            else if (inputMap.w) {
                this.primed = false;
                this.selectedMenuIndex--;
                if (this.selectedMenuIndex < 0){
                    this.selectedMenuIndex = this.menuItems -1;
                }
                this.drawStrings();
            }

            if (inputMap.enter && this.selectedMenuIndex === 0) {
                this.game.clearText('all');
                this.game.pushState('single player');
            }
            else if (inputMap.enter && this.selectedMenuIndex === 1) {
                this.game.clearText('all');
                this.game.pushState('level editor');
            }
        }
        else if (this.countDown >= 10) {
            this.countDown = 0;
            this.primed = true;
        }
        else {
            this.countDown++;
        }
        
    }

    sRender() {
        this.game.drawFrame(new Vec(20, 20));
    }
}

module.exports = GameState_Menu;
