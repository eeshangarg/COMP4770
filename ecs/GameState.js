// @flow
/* istanbul ignore file */
/* global module */
/* global require */
const GameEngine  = require('./GameEngine.js');


class GameState {
    GameEngine: GameEngine;
    paused: boolean;
    update(){}
}



module.exports = GameState;