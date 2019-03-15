// @flow
/* istanbul ignore file */
/* global module */
/* global require */

const GameState = require('./GameState.js');
const GameEngine = require('./GameEngine.js');

class GameState_Menu extends GameState {
    gameEngine: GameEngine;
    title: string;
    menuStrings: Array<string>;
    levelPaths: Array<string>;
    selectedMenuIndex: number;

    constructor(game: GameEngine) {
        super();

        this.gameEngine = game;
        this.title = "The Knight Before";
        this.menuStrings = [];
        this.menuStrings.push('Level 1');
        this.menuStrings.push('Level 2');
        this.menuStrings.push('Level 3');
        this.levelPaths = [];
        this.levelPaths.push('level1.json');
        this.levelPaths.push('level2.json');
        this.levelPaths.push('level3.json');
        this.selectedMenuIndex = 0;
    }

    update() {
        this.sUserInput();
        this.sRender();

        this.gameEngine.renderQueue = [];
    }

    sUserInput() {
        // TODO: Process all user input here
        let inputMap = this.gameEngine.getInputMap();
        if (inputMap.s) {
            inputMap.s;
        }
    }

    sRender() {
        // TODO: Handle all rendering here.
    }
}

module.exports = GameState_Menu;
