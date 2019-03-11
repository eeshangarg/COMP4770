// @flow
/* global module */
/* istanbul ignore file */
// flowlint unclear-type:off
// flowlint untyped-import:off

/* global require */
const GameState = require("./GameState.js");
const GameState_test = require("./GameState_test.js");

class GameEngine {

    socket: Object;
    states: Array<GameState>;
    statesToPush: Array<GameState>;
    popStates: number;
    running: boolean;
    inputMap: Object;
    quit: void => void;
    run: void => void;
    init: void => void;
    update: void => void;
    pushState: GameState => void;
    popState: void => void;
    getInputMap: void => Object;
    setInputMap: Object => void;
    self: GameEngine;

    constructor(socket: Object) {

        let self = this;
        this.socket = socket;
        this.states = [];
        this.statesToPush = [];
        this.popStates = 0;
        this.running = true;

        this.inputMap = {
            w: false,
            a: false,
            d: false,
            s: false,
            space: false,
            enter: false
        };


        // An intializer function for the game enginge. 
        this.init = function() {
            let state = new GameState_test(this);
            state.init();
            this.pushState(state)
            this.run()
        }

        // The man "Run" loop of the game engine. Hold the run-interval.
        this.run = function() {
            this.runInterval = setInterval(function(self: GameEngine) {
                if (self.running) {
                    self.update();
                } else {
                    clearInterval(this)
                }
            }, 16.666, self);
        }


        this.update = function() {

            // Pop of N states queued to be popped.
            for (let i = 0; i < this.popStates.length; i++) {
                if (this.state.length > 0) {
                    this.states.pop();
                }
            }
            // Reset the pop-state counter.
            this.popStates = 0;

            // Push on the states that were requested to be pushed.
            for (let i = 0; i < this.statesToPush.length; i++) {
                this.states.push(this.statesToPush[i]);
            }

            // Update the top of the state stack. 
            this.states[this.states.length - 1].update();


        }

        // Push a state onto the "States to be pushed" stack.
        this.pushState = function(state: GameState) {
            this.statesToPush.push(state);
        }

        // Queue up a state to be popped. (always top state.)
        this.popState = function() {
            this.popStates += 1;
        }

        // Gracefully quit out of the engine.
        this.quit = function() {
            this.running = false;
        }

        // Set the engines Input-map to be used by IO helper.
        this.setInputMap = function(map: Object) {
            this.inputMap = map;
        }

        // Get the engines Input-map to be used by IO helper.
        this.getInputMap = function(): Object {
            return this.inputMap;
        }

    }

}

module.exports = GameEngine;