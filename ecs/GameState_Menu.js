// @flow
/* istanbul ignore file */
/* global module */
/* global require */

const GameState = require('./GameState.js');
const GameState_Play = require("./GameState_Play.js");
const GameState_LevelEditor = require("./GameState_LevelEditor.js");
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
        this.menuStrings.push('Single Player');
        this.menuStrings.push('Level Editor');
        this.menuStrings.push('Items');
        this.menuStrings.push('Settings');
        this.game.setBackground('bg_menu');
        this.menuItems = this.menuStrings.length;
        this.game.drawText(this.title, 'title', '35px PS2P', '#FFFF00', 250, 125);
        this.drawStrings();
    }

    update() {
        this.sUserInput();
        this.sRender();
    }


    drawStrings() {
            for (let i = 0; i < this.menuStrings.length; i++) {
                this.game.drawText(this.menuStrings[i], this.menuStrings[i], '30px Seagram', '#FDFEFE', 450, 225 + i*60);
            }
            let i = this.selectedMenuIndex;
            this.game.drawText(this.menuStrings[i], this.menuStrings[i], '30px Seagram', '#FF0C00', 450, 225 + i*60);
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
                this.primed = false;
                this.game.clearText('all');
                let state: GameState_Play = new GameState_Play(this.game, 'SomeLevel');
                this.game.pushState(state);
            }
            else if (inputMap.enter && this.selectedMenuIndex === 1) {
                this.primed = false;
                this.game.clearText('all');
                let state: GameState_LevelEditor = new GameState_LevelEditor(this.game);
                this.game.pushState(state);
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
