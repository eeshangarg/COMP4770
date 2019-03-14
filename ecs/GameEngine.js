// @flow
/* global module */
/* istanbul ignore file */
// flowlint unclear-type:off
// flowlint untyped-import:off

/* global require */
const GameState = require("./GameState.js");
const GameState_test = require("./GameState_test.js");
const Animation = require("./../rendering/Animation.js");


class GameEngine {

    self: GameEngine;
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
    draw: (anim: Animation,dir: number,dx: number,dy: number) => void;
    queueAnimation: (id: number,frame: number,dx: number,dy: number) => void;
    renderQueue: Array<Object>;

    constructor(socket: Object) {

        let self = this;
        this.socket = socket;
        this.states = [];
        this.renderQueue = [];
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
            let state: GameState_test = new GameState_test(this);
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

        // The function to "Queue" an Animation. Only used by Rendering.
        this.queueAnimation = function(id: number, frame: number, dx: number, dy: number) {
            // If queued with frame -1 push a static animation onto renderQueue.
            if (frame == -1) {
                this.renderQueue.push({
                    n: id,
                    d: [dx, dy]
                });
            } else {
                this.renderQueue.push({
                    n: id,
                    d: [dx, dy],
                    f: frame
                });
            }
        }


        this.draw = function(anim: Animation, dir: number, dx: number, dy: number) {
            let id = 0;
            if (dir === -1) {
                id = anim.lid;
            } else {
                id = anim.rid;
            }
            if (anim.frameCount === 0) {
                this.queueAnimation(id, -1, dx, dy);
            } else {
                this.queueAnimation(id, anim.animationFrame, dx, dy);
            }
        }
    }

}

module.exports = GameEngine;